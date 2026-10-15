// ---------- Data ----------
// The Explore cards live in index.html (exploreGrid section).
// To change a picture, replace the file in img/items/ (same name).
// To change an owner's contact, edit data-owner / data-email / data-phone
// on that card in index.html.
var items = [];
var myItems = [];
var wishlist = [];
var nextId = 100;
var currentItem = null;
var lastFocus = null;

var icons = {
  Books: "📚",
  Electronics: "💻",
  Furniture: "🪑",
  Clothing: "👕",
  Stationery: "✏️",
  Sports: "🏏",
};

// Make text safe to put inside HTML
function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Read the cards written in the HTML
function readItems() {
  var cards = document.querySelectorAll("#exploreGrid .card");
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    var img = c.querySelector(".thumb img");
    items.push({
      id: Number(c.dataset.id),
      name: c.dataset.name,
      cat: c.dataset.cat,
      type: c.dataset.type,
      price: c.dataset.price,
      cond: c.dataset.cond,
      owner: c.dataset.owner,
      email: c.dataset.email,
      phone: c.dataset.phone,
      img: img ? img.getAttribute("src") : "",
    });
  }
}

// ---------- Build one card (wishlist, your listings, new posts) ----------
function makeCard(item) {
  var tag = "Swap";
  if (item.type == "Sell") {
    tag = "₹" + item.price;
  }
  var heart = "♡";
  var heartClass = "heart";
  if (wishlist.indexOf(item.id) != -1) {
    heart = "♥";
    heartClass = "heart on";
  }

  // Photo covers the emoji. If there is no photo, the emoji shows instead.
  var photo = "";
  if (item.img) {
    photo =
      '<img src="' + esc(item.img) + '" alt="' + esc(item.name) +
      '" loading="lazy" onerror="this.remove()">';
  }

  // Your own listings show a note instead of a contact button
  var action =
    '<button class="contact-btn" onclick="openContact(' + item.id + ')">Contact owner</button>';
  if (item.mine) {
    action = '<span class="mine-note">Your listing</span>';
  }

  return (
    '<div class="card" data-id="' + item.id + '" data-name="' + esc(item.name) +
    '" data-cat="' + esc(item.cat) + '" data-type="' + esc(item.type) +
    '" data-price="' + esc(item.price) + '" data-cond="' + esc(item.cond) +
    '" data-owner="' + esc(item.owner) + '" data-email="' + esc(item.email) +
    '" data-phone="' + esc(item.phone) + '">' +
    '<button class="' + heartClass + '" data-id="' + item.id +
    '" onclick="toggleWish(' + item.id + ')">' + heart + "</button>" +
    '<div class="thumb">' + icons[item.cat] + photo + "</div>" +
    '<div class="card-body"><h3>' + esc(item.name) + "</h3>" +
    "<small>" + esc(item.cat) + " - " + esc(item.cond) + "</small>" +
    '<div class="card-foot"><span class="tag">' + tag + "</span></div>" +
    action + "</div></div>"
  );
}

function showList(gridId, list) {
  var html = "";
  for (var i = 0; i < list.length; i++) {
    html = html + makeCard(list[i]);
  }
  document.getElementById(gridId).innerHTML = html;
}

// ---------- Hearts ----------
function syncHearts() {
  var hearts = document.querySelectorAll(".heart");
  for (var i = 0; i < hearts.length; i++) {
    var id = Number(hearts[i].dataset.id);
    var saved = wishlist.indexOf(id) != -1;
    hearts[i].textContent = saved ? "♥" : "♡";
    hearts[i].className = saved ? "heart on" : "heart";
  }
}

// ---------- Wishlist and My listings ----------
function showWishlist() {
  var all = myItems.concat(items);
  var saved = [];
  for (var i = 0; i < all.length; i++) {
    if (wishlist.indexOf(all[i].id) != -1) {
      saved.push(all[i]);
    }
  }
  showList("wishGrid", saved);
  document.getElementById("wishEmpty").hidden = saved.length > 0;
}

function showMyListings() {
  showList("myGrid", myItems);
  document.getElementById("myEmpty").hidden = myItems.length > 0;
}

function toggleWish(id) {
  var position = wishlist.indexOf(id);
  if (position == -1) {
    wishlist.push(id);
  } else {
    wishlist.splice(position, 1);
  }
  showWishlist();
  syncHearts();
}

// ---------- Explore: search and filter ----------
function showItems() {
  var text = document.getElementById("search").value.toLowerCase();
  var cat = document.getElementById("catFilter").value;
  var type = document.getElementById("typeFilter").value;
  var cards = document.querySelectorAll("#exploreGrid .card");
  var shown = 0;

  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    var okName = c.dataset.name.toLowerCase().indexOf(text) != -1;
    var okCat = cat == "" || c.dataset.cat == cat;
    var okType = type == "" || c.dataset.type == type;
    var match = okName && okCat && okType;
    c.hidden = !match;
    if (match) {
      shown = shown + 1;
    }
  }
  document.getElementById("exploreEmpty").hidden = shown > 0;
}

// ---------- Category cards ----------
function selectCategory(name) {
  document.getElementById("catFilter").value = name;
  showItems();
  document.getElementById("explore").scrollIntoView();
}

// ---------- Contact pop-up ----------
function findItem(id) {
  var all = myItems.concat(items);
  for (var i = 0; i < all.length; i++) {
    if (all[i].id == id) {
      return all[i];
    }
  }
  return null;
}

function openContact(id) {
  var item = findItem(id);
  if (!item) {
    return;
  }
  currentItem = item;
  lastFocus = document.activeElement;

  var price = item.type == "Sell" ? "₹" + item.price : "Swap";
  document.getElementById("cmTitle").textContent = "Contact " + item.owner;
  document.getElementById("cmItem").textContent = item.name + " · " + price;

  var info = "Email: " + item.email;
  if (item.phone) {
    info = info + "  |  Phone: " + item.phone;
  }
  document.getElementById("cmInfo").textContent = info;

  var ask =
    item.type == "Sell"
      ? "Is it still available? Can we meet on campus?"
      : "I would like to swap. Can we talk about what I could offer?";
  document.getElementById("cmMsg").value =
    "Hi " + item.owner + ", I saw your " + item.name +
    " on SwapSphere and I'm interested. " + ask;

  document.getElementById("cmNote").textContent = "";
  updateContactLinks();
  document.getElementById("contactModal").hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("cmMsg").focus();
}

// Keep the email and WhatsApp buttons in sync with the message
function updateContactLinks() {
  if (!currentItem) {
    return;
  }
  var text = document.getElementById("cmMsg").value;
  var subject = "SwapSphere: " + currentItem.name;

  document.getElementById("cmEmail").href =
    "mailto:" + currentItem.email +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(text);

  var wa = document.getElementById("cmWa");
  var digits = (currentItem.phone || "").replace(/\D/g, "");
  if (digits.length == 10) {
    digits = "91" + digits; // 10-digit Indian number: add country code
  }
  if (digits.length >= 11) {
    wa.href = "https://wa.me/" + digits + "?text=" + encodeURIComponent(text);
    wa.hidden = false;
  } else {
    wa.hidden = true;
  }
}

function copyEmail() {
  var note = document.getElementById("cmNote");
  note.className = "msg ok";
  if (navigator.clipboard) {
    navigator.clipboard.writeText(currentItem.email).then(
      function () {
        note.textContent = "Email copied.";
      },
      function () {
        note.textContent = "Email: " + currentItem.email;
      }
    );
  } else {
    note.textContent = "Email: " + currentItem.email;
  }
}

// Close with the X button, a click outside the box, or the Escape key
function closeContact(event) {
  if (event && event.target.id != "contactModal") {
    return;
  }
  document.getElementById("contactModal").hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) {
    lastFocus.focus();
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key == "Escape" && !document.getElementById("contactModal").hidden) {
    closeContact();
  }
});

// ---------- List an item form ----------
function showPrice() {
  var type = document.getElementById("fType").value;
  document.getElementById("priceRow").hidden = type != "Sell";
}

function addItem(event) {
  event.preventDefault();
  var msg = document.getElementById("formMsg");
  var owner = document.getElementById("fOwner").value.trim();
  var email = document.getElementById("fEmail").value.trim();
  var phone = document.getElementById("fPhone").value.trim();
  var name = document.getElementById("fName").value.trim();
  var cat = document.getElementById("fCat").value;
  var type = document.getElementById("fType").value;
  var price = document.getElementById("fPrice").value;
  var cond = document.getElementById("fCond").value;
  var file = document.getElementById("fPhoto").files[0];

  msg.className = "msg err";
  if (owner.length < 2) {
    msg.innerHTML = "Enter your name so students know who to contact.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.innerHTML = "Enter a valid email address, for example name@college.edu.";
    return;
  }
  if (phone != "" && phone.replace(/\D/g, "").length < 10) {
    msg.innerHTML = "Enter a phone number with at least 10 digits, or leave it empty.";
    return;
  }
  if (name.length < 3) {
    msg.innerHTML = "Enter an item name of at least 3 characters.";
    return;
  }
  if (cat == "") {
    msg.innerHTML = "Select a category.";
    return;
  }
  if (type == "Sell" && (price == "" || price <= 0)) {
    msg.innerHTML = "Enter a price greater than 0 for items you sell.";
    return;
  }

  if (type == "Swap") {
    price = 0;
  }
  var newItem = {
    id: nextId,
    name: name,
    cat: cat,
    type: type,
    price: price,
    cond: cond,
    owner: owner,
    email: email,
    phone: phone,
    mine: true,
    img: file ? URL.createObjectURL(file) : "",
  };
  nextId = nextId + 1;
  myItems.unshift(newItem);

  // Add the new card to the top of Explore
  document
    .getElementById("exploreGrid")
    .insertAdjacentHTML("afterbegin", makeCard(newItem));

  // Keep your contact details filled in for your next listing
  document.getElementById("fName").value = "";
  document.getElementById("fCat").value = "";
  document.getElementById("fPrice").value = "";
  document.getElementById("fDesc").value = "";
  document.getElementById("fPhoto").value = "";
  msg.className = "msg ok";
  msg.innerHTML = "Item posted. Students can now contact you at " + email + ".";

  showMyListings();
  showItems();
}

// ---------- Mobile menu ----------
function toggleMenu() {
  document.getElementById("navbar").classList.toggle("open");
}

// Run when the page loads
readItems();
showWishlist();
showMyListings();
showItems();