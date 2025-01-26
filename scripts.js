window.onload = function () {
  checkCheckboxes(); //Required in order for the table to resize correctly, all checkboxes are ticked initially, all file details will show
  getPosts();
  updateTime(); //Update the time to show when the page was generated
  loadVideos();
  let logo = document.getElementById("logo");
  if (logo) logo.src = "./Yo.gif";
};

const videos = ["Soon_1.mp4", "Soon_2.mp4", "Soon_3.mp4"];

/**
 * Checks all the checkboxes (used to represent which file details are visible)
 */
function checkCheckboxes() {
  const checkboxes = document.getElementsByClassName("checkbox");
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes.item(i).checked = true;
  }
}

function getPosts() {
  document.getElementById("loading").style.visibility = "visible"; //Display the loading icon before making a request for the directory

  clearTable(); //Clear the table displaying the contents of the current directory

  //Reset the search bar
  const search = document.getElementById("search");
  search.value = "";
  search.style.borderBottomColor = "#111";

  //Adding new rows
  const list = document.getElementsByTagName("tbody")[0];
  fetch("posts.json")
    .then((res) => res.json())
    .then((res) => {
      for (let i = res.length - 1; i >= 0; i--) {
        const row = document.createElement("tr");
        row.appendChild(
          createTD(
            new Date(res[i]["date"]).toLocaleString(),
            document.getElementById("showDates").checked
          )
        );
        const post = createTD(
          res[i]["post"],
          document.getElementById("showPosts").checked
        );
        const text = document.createElement("div");
        text.innerHTML = res[i]["text"];
        text.classList.add("hidden");
        post.appendChild(text);
        post.addEventListener("click", () => {
          toggleView(text);
        });
        row.appendChild(post);
        list.appendChild(row);
      }
      document.getElementById("loading").style.visibility = "hidden"; //After the request is complete, hide the loading animation
    });
}

function getPost() {}

/**
 * Clears the table displaying the file listings
 */
function clearTable() {
  //Replacing old tbody with a new one
  const old_list = document.getElementsByTagName("tbody")[0];
  const new_list = document.createElement("tbody");
  old_list.parentNode.replaceChild(new_list, old_list);
}

/**
 * Creates a data entry for a file (a td element), given whether a value and whether or not it is displayed (some columns are filtered)
 * @param {string} value
 * @param {boolean} checked
 */
function createTD(value, checked) {
  const td = document.createElement("td");
  td.innerHTML = value;
  if (checked) {
    td.style.display = "table-cell"; //displayed
  } else {
    td.style.display = "none"; //not displayed
  }
  return td;
}

/**
 * Used to toggle dropdowns, whether they are showing or not. Pass in the id number of the dropdown (where it appears indexed against others)
 * @param {number} dropdown
 */
function toggle(dropdown) {
  document
    .getElementsByClassName("dropdown-text")
    [dropdown].classList.toggle("selected");
  document
    .getElementsByClassName("dropdown-text")
    [dropdown].classList.toggle("unselected");
  document
    .getElementsByClassName("dropdown-content")
    [dropdown].classList.toggle("show"); //Showing the contents of the dropdown
  document
    .getElementsByClassName("dropdown-content")
    [dropdown].classList.toggle("hidden"); //Showing the contents of the dropdown
}

/**
 * Used to hide/show columns for each table row
 * @param {number} column
 */
function filter(column) {
  let rows = document.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    toggleColumn(rows.item(i).children[column]); //Get the nth child corresponding to the table column and hide it, for each row
  }
}

/**
 * Used to hide/show (toggle) an element (column)
 * @param {*} element
 */
function toggleColumn(element) {
  if (element.style.display == "none") {
    //If not showing
    element.style.display = "table-cell"; //Show
  } else {
    //If showing
    element.style.display = "none"; //hide
  }
}

function toggleView(element) {
  if (element.classList.contains("hidden")) {
    //If not showing
    element.classList.remove("hidden");
  } else {
    //If showing
    element.classList.add("hidden");
  }
}

/**
 * Sorts all file listings by a given column
 * @param {number} column
 */
function sort(column) {
  const headings = document.getElementsByTagName("th");

  //If the column has already been sorted, want to reverse sort, add reverse to classlist
  if (event.target.classList.contains("sorted")) {
    event.target.classList.toggle("reverse");
  }
  for (let i = 0; i < headings.length; i++) {
    //Sorting by one column means all the other columns are not necessarily going to be sorted, remove sorted from classlist if another column has
    headings[i].classList.remove("sorted");
  }
  event.target.classList.add("sorted"); //add sorted to the column classlist, the column being sorted

  const rows = document
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  let rowsArr = [];

  for (let i = 0; i < rows.length; i++) {
    rowsArr.push(rows.item(i)); //Pushing each of the file listings into an array
  }

  rowsArr.sort(function (a, b) {
    return a.children[column].innerHTML.localeCompare(
      b.children[column].innerHTML
    ); //If we are comparing strings, comparison function returns value of localeCompare()
  });

  if (event.target.classList.contains("reverse")) {
    //If the column has already been sorted, reverse the array (generate reverse sorted)
    rowsArr.reverse();
  }

  clearTable(); //Clear table
  const list = document.getElementsByTagName("tbody")[0];

  for (let i = 0; i < rowsArr.length; i++) {
    //Populate table with new ordering
    list.appendChild(rowsArr[i]);
  }
}

/**
 * Searches for files in the remote, root directory (and all sub-directories) using the search term in the search bar
 */
function search() {
  document.getElementById("loading").style.visibility = "visible"; //Start the loading animation (before file search is requested from the server)
  const search = document.getElementById("search");
  //As long as the search bar isn't clear, request file search
  if (!isSearchClear(search)) {
    fetch("posts.json")
      .then((res) => res.json())
      .then((res) => {
        clearTable(); //Clear the file list
        const list = document.getElementsByTagName("tbody")[0];
        let found = false;
        let filter, post, date;
        filter = search.value.toUpperCase();
        for (let i = 0; i < res.length; i++) {
          post = res[i]["post"];
          date = new Date(res[i]["date"]).toLocaleString();
          if (
            post
              .replace(/<[^>]*>/g, "")
              .toUpperCase()
              .indexOf(filter) > -1 ||
            date.indexOf(filter) > -1
          ) {
            const row = document.createElement("tr");
            row.appendChild(
              createTD(
                new Date(res[i]["date"]).toLocaleString(),
                document.getElementById("showDates").checked
              )
            );

            const post = createTD(
              res[i]["post"],
              document.getElementById("showPosts").checked
            );
            const text = document.createElement("div");
            text.innerHTML = res[i]["text"];
            text.classList.add("hidden");
            post.appendChild(text);
            post.addEventListener("click", () => {
              toggleView(text);
            });
            row.appendChild(post);
            list.appendChild(row);
            found = true;
          }
        }
        if (found) {
          search.style.borderBottomColor = "#24FF00";
        } else {
          search.style.borderBottomColor = "#FF2400";
        }
      });
    document.getElementById("loading").style.visibility = "hidden"; //Hide the loading animation
  }
}

/**
 * Checks whether the (search) input passed in is empty
 * @param {element} search
 */
function isSearchClear(search) {
  //If search input is empty
  if (search.value == "") {
    search.style.borderBottomColor = "#111"; //Underline in neutral colour
    getPosts();
    return true; //Return true
  }
  return false; //Otherwise return false, there is something in the search bar
}

/**
 * Updates the time element in the HTML to display the current time
 */
function updateTime() {
  let time = new Date();
  document.getElementById("time").innerHTML = time.toUTCString();

  let hour = time.getHours();

  if (hour >= 6 && hour < 18) {
    document.getElementById("sky").src = "Sun.gif";
    document.getElementById("sky2").innerHTML = "☀️";
    document.getElementById("clouds").src = "Rain2.gif";
    document.getElementById("clouds2").innerHTML = "🌧️";
  } else {
    document.getElementById("sky").src = "Moon.gif";
    document.getElementById("sky2").innerHTML = "🌑";
    document.getElementById("clouds").src = "Clouds2.gif";
    document.getElementById("clouds2").innerHTML = "☁️";
  }

  // if (Math.random() < 0.5) {
  //   document.getElementById("clouds").src = "Rain2.gif";
  //   document.getElementById("clouds2").innerHTML = "🌧️";
  // } else {
  //   document.getElementById("clouds").src = "Clouds2.gif";
  //   document.getElementById("clouds2").innerHTML = "☁️";
  // }
}

function loadVideos() {
  const video = document.getElementById("soon");
  video.src = videos[Math.floor(Math.random() * videos.length)];
  video.load();
  video.play();
}
