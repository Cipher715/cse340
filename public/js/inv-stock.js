'use strict'

let sortList = document.querySelector('#inv_sort');
sortList.addEventListener("change", function() {
    let order = sortList.value;
    let sortURL = "/inv/stock/"+order;
    fetch(sortURL)
        .then(function (response) { 
            if (response.ok) { 
                return response.json(); 
            } 
            throw Error("Network response was not OK"); 
        })
        .then(function (data) { 
            console.log(data); 
            buildInventoryList(data); 
        }) 
        .catch(function (error) { 
            console.log('There was a problem: ', error.message) 
        }) 
});

function buildInventoryList(data) { 
    let inventoryList = document.getElementById("inventoryList"); 
    // Set up the table labels 
    let dataTable = '<thead>'; 
    if(sortList.value.includes("inv_price")) {
        dataTable += '<tr><th>Vehicle Name</th><td style="color: black">Price</td><td>Miles</td><td>Year</td></tr>'; 
    } else if(sortList.value.includes("inv_miles")){
        dataTable += '<tr><th>Vehicle Name</th><td>Price</td><td style="color: black">Miles</td><td>Year</td></tr>'; 
    } else{
        dataTable += '<tr><th>Vehicle Name</th><td>Price</td><td>Miles</td><td style="color: black">Year</td></tr>'; 
    }
    dataTable += '</thead>'; 
    // Set up the table body 
    dataTable += '<tbody>'; 
    // Iterate over all vehicles in the array and put each in a row 
    data.forEach(function (element) { 
     dataTable += `<tr><td><a href='/inv/detail/${element.inv_id}' title='click to view details'>${element.inv_make} ${element.inv_model}</a></td>`; 
     dataTable += "<td>$" + new Intl.NumberFormat('en-US').format(element.inv_price) + "</td>"; 
     dataTable += "<td>" + new Intl.NumberFormat('en-US').format(element.inv_miles) + "</td>"; 
     dataTable += `<td>${element.inv_year}</td></tr>`;  
    }) 
    dataTable += '</tbody>'; 
    // Display the contents in the Inventory Management view 
    inventoryList.innerHTML = dataTable; 
}