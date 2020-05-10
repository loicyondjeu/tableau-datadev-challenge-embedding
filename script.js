var viz;

function initViz() {
    var containerDiv = document.getElementById("vizContainer"),
        // define url to a Overview view from the Superstore workbook on my tableau dev site
        url = "https://10ax.online.tableau.com/t/loicplaygrounddev353480/views/Superstore/Overview?:showAppBanner=false&:display_count=n&:showVizHome=n";
        options = {
            hideTabs: true,
            onFirstInteractive: function () {
                var worksheets = getWorksheets(viz);
                processFilters(worksheets);
                viz.addEventListener('filterchange', (filterEvent) => {
                    var worksheets = getWorksheets(filterEvent.getViz());
                    processFilters(worksheets);
                });
            }
        };

    viz = new tableau.Viz(containerDiv, url, options);
}

function processFilters(worksheets) {
    getFilters(worksheets).then(allFilters => {
        filters = allFilters.flat();
        filters = removeDuplicates(filters);
        displayFilterValues(filters);
    });
}

function getWorksheets(viz) {
    return viz.getWorkbook().getActiveSheet().getWorksheets();
}


function getFilters(worksheets) {
    var allfiltersPromises = [];
    worksheets.forEach(worksheet => {
        var filterPromise = worksheet.getFiltersAsync(); 
        allfiltersPromises.push(filterPromise);
    });
    return Promise.all(allfiltersPromises);
}

function displayFilterValues(filters) {
    var filterContainerElement = document.getElementById("filterTableBody");
    var innerHtml = "" ;
    filters.forEach(filter => {
        if (filter.$type === "categorical") {
            var appliedValues = "";
            filter.$appliedValues.forEach(value => {
                appliedValues += `<span class="badge badge-primary"> ${value.formattedValue} </span> \n`;
            });
            innerHtml += `
                <tr>
                    <th> ${filter.$caption} </th>
                    <td> ${appliedValues} <td>
                </tr> \n`; 
        }
    });
    filterContainerElement.innerHTML = innerHtml;
}

function removeDuplicates(filters) {
    uniquefilters = filters.filter((filter, pos) => {
        return filters.findIndex(item => item.$caption === filter.$caption) == pos;
    });
    return [...uniquefilters];
}

function clearFilters() {
    if (viz) {
       var worksheets =  viz.getWorkbook().getActiveSheet().getWorksheets();
       worksheets.forEach(worksheet => {
           worksheet.getFiltersAsync().then(filters => {
               filters.forEach(filter => {
                   worksheet.clearFilterAsync(filter.$caption);
               })
           })
       });
    }
}