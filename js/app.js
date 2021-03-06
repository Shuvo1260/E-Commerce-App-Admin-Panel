//Firebase Configuration

import { firebaseConfig } from "./../Config/FirebaseConfig.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var firestore = firebase.firestore();

//Taking Input from the excel file
let selectedFile;

document.getElementById("input").addEventListener("change", (event) => {
    selectedFile = event.target.files[0];
});

var monthList = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

var myArray = [];

document.getElementById("button").addEventListener("click", () => {
    if (selectedFile) {
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(selectedFile);
        fileReader.onload = (event) => {
            //console.log(event.target.result);
            let data = event.target.result;
            let workbook = XLSX.read(data, { type: "binary" });
            //console.log(workbook);
            workbook.SheetNames.forEach((sheet) => {
                let rowObject = XLSX.utils.sheet_to_row_object_array(
                    workbook.Sheets[sheet]
                );
                //console.log(rowObject);
                myArray = rowObject;
                console.log(myArray);
                //document.getElementById("jsondata").innerHTML = JSON.stringify(rowObject, undefined, 4);
            });
            // Saving Data
            event.preventDefault();
            for (var i = 0; i < myArray.length; i++) {
                var priceList = [];
                priceList.push(myArray[i].Price);
                var dateList = [];
                const d = myArray[i].Date;
                //alert(d);
                //console.log(d);
                var dateObj = new Date(1900, 0, 0);
                dateObj.setDate(dateObj.getDate() - 1 + d);
                //console.log(dateObj);
                let m = dateObj.getMonth();
                let month = monthList[m];
                let y = dateObj.getFullYear().toString();
                let year = y.substring(y.length - 2, y.length);
                let day = dateObj.getDate();
                //console.log(day);

                let date = day + "-" + month + "-" + year;
                dateList.push(date);
                var code = myArray[i].Code.toString(10);
                console.log(code);
                firestore
                    .collection("Products")
                    .doc(code)
                    .set({
                        storageImageUrl: "",
                        imageUrl: "",
                        productCode: code,
                        productName: myArray[i].Title,
                        dateList: dateList,
                        priceList: priceList,
                        category: myArray[i].Category,
                        productType: myArray[i].Product_Type,
                        bottomMessage: "",
                    })
                    .then(function () {
                        console.log("Data Saved!");
                    })
                    .catch(function (error) {
                        console.log("Got an error ", error);
                    });
                Swal.fire({
                    icon: "success",
                    title: "Successfully Uploaded",
                    showConfirmButton: false,
                    timer: 3000,
                }).then((result) => {
                    location.reload();
                });
            }
        };
    }
});

document.getElementById("uploadBtn").addEventListener("click", (e) => {
    window.location.href = "upload.html";
});

//Saving Data from the form manually
/*
const productName = document.querySelector("#productName");
const price = document.querySelector("#price");
const code = document.querySelector("#code");
const submitBtn = document.querySelector("#submitBtn");

submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    firestore
        .collection("products")
        .doc(code.value)
        .set({
            ProductName: productName.value,
            Price: price.value,
            Code: code.value,
        })
        .then(function () {
            console.log("Data Saved!");
        })
        .catch(function (error) {
            console.log("Got an error ", error);
        });

    productName.value = "";
    price.value = "";
    code.value = "";
});


function editFunction() {
    var getCode = prompt("Type the product code: ");
    localStorage.setItem("storageName", getCode);
    console.log("Edit Button Clicked");
}
*/
const productList = document.querySelector("#productList");
// Product List Display
function renderProductList(doc) {
    //let li = document.createElement("li");
    let content = document.createElement("div");
    let span = document.createElement("span");

    if (doc.data().imageUrl != "") {
        imageUrl = doc.data().imageUrl;
    } else if (doc.data().storageImageUrl != "") {
        imageUrl = doc.data().storageImageUrl;
    } else {
        var imageUrl =
            "https://firebasestorage.googleapis.com/v0/b/prizer-kuwait.appspot.com/o/no-image.jpg?alt=media&token=de46086b-4c2d-4311-bbad-89ee438727c9";
    }

    content.innerHTML +=
        `<div class="card" style="width: 24rem;">
        <img class="card-image" src=${imageUrl} >
        <h4 class="text-center" id="productName">` +
        doc.data().productName +
        `</h4>

    <p class="text-center"> Category: ` +
        doc.data().category +
        `</p>
    <p class="text-center"> Code: ` +
        doc.data().productCode +
        `</p>
        <a href="edit.html" onclick="editFunction(${
            doc.data().productCode
        })" class="btn btn-secondary">Edit</a>
        
        <a class="btn btn-danger" onclick="deleteFunction(${
            doc.data().productCode
        })">Delete</a>
</div> `;

    //li.appendChild(content);

    productList.appendChild(content);
}

//Real Time Data Fetching

firestore.collection("Products").onSnapshot((snapshot) => {
    let changes = snapshot.docChanges();
    changes.forEach((change) => {
        //console.log(change.doc.data());
        if (change.type === "added") {
            renderProductList(change.doc);
        }
    });
});

const searchBar = document.querySelector("#searchProducts");
searchBar.addEventListener("keyup", function (e) {
    const term = e.target.value.toLowerCase();
    const products = productList.getElementsByTagName("div");
    Array.from(products).forEach(function (product) {
        var a = product.getElementsByTagName("h4")[0];
        if (a.innerHTML.toLowerCase().indexOf(term) != -1) {
            product.style.display = "grid";
        } else {
            product.style.display = "none";
        }
    });
});
