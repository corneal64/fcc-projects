$(document).ready(function () {
  var searchTerm = "";

  // Handle form submission (button click or Enter key)
  $("#search-form").on("submit", function (e) {
    e.preventDefault();
    searchTerm = $("#input").val().trim();

    if (searchTerm === "") {
      $("#wikibox").empty();
      $("#wikibox").append(
        '<div class="empty-state">Please enter a search term.</div>',
      );
      return;
    }

    $("#wikibox").empty();
    $("#wikibox").append('<div class="loading">Searching...</div>');
    wikiQuery();
  });

  function wikiQuery() {
    var url =
      "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrlimit=10&prop=extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch=" +
      encodeURIComponent(searchTerm) +
      "&origin=*";

    $.ajax({
      dataType: "json",
      url: url,
      success: function (wikipedia) {
        $("#wikibox").empty();

        if (!wikipedia.query || !wikipedia.query.pages) {
          $("#wikibox").append(
            '<div class="empty-state">No results found for "' +
              searchTerm +
              '".</div>',
          );
          return;
        }

        var wikiPages = wikipedia.query.pages;
        var pageIds = Object.keys(wikiPages);

        for (var i = 0; i < pageIds.length; i++) {
          var page = wikiPages[pageIds[i]];
          var wikiLink = "https://en.wikipedia.org/?curid=" + page.pageid;
          var extract = page.extract || "No description available.";

          $("#wikibox").append(
            '<a href="' +
              wikiLink +
              '" target="_blank" rel="noopener noreferrer" class="result-card">' +
              '<h2 class="result-title">' +
              page.title +
              "</h2>" +
              '<p class="result-snippet">' +
              extract +
              "</p>" +
              "</a>",
          );
        }
      },
      error: function () {
        $("#wikibox").empty();
        $("#wikibox").append(
          '<div class="empty-state">Something went wrong. Please try again.</div>',
        );
      },
    });
  }
});
