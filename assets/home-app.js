(function () {
  const content = document.getElementById("home-page-content");
  const navigation = document.querySelector(".home-nav");
  if (!content || !navigation) return;

  const homeMarkup = content.innerHTML;
  const pages = {
    home: {
      title: "Shiyu Zhang"
    },
    papers: {
      title: "Shiyu Zhang Papers",
      source: "assets/papers-content.html"
    },
    talks: {
      title: "Shiyu Zhang Talks",
      source: "conferences/index.html"
    },
    useful: {
      title: "Shiyu Zhang Useful links",
      source: "Useful%20links/index.html"
    },
    teaching: {
      title: "Shiyu Zhang Teaching",
      source: "Teaching/Analysis%201/index.html"
    }
  };
  const links = Array.from(navigation.querySelectorAll("a[data-page]"));

  function pageFromUrl() {
    const page = new URL(window.location.href).searchParams.get("page");
    return pages[page] ? page : "home";
  }

  function setActivePage(page) {
    links.forEach(function (link) {
      const isCurrent = link.dataset.page === page;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setUrl(page, replace) {
    const url = page === "home" ? "./" : "?page=" + encodeURIComponent(page);
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({ page: page }, "", url);
  }

  async function loadPage(page, options) {
    const settings = Object.assign({ push: true }, options);
    if (!pages[page]) page = "home";

    content.setAttribute("aria-busy", "true");
    try {
      if (page === "home") {
        content.innerHTML = homeMarkup;
        content.classList.remove("is-subpage-content");
      } else {
        const response = await fetch(pages[page].source, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load " + pages[page].source);
        const documentText = await response.text();
        const parsedDocument = new DOMParser().parseFromString(documentText, "text/html");
        const sourceContent = parsedDocument.querySelector(".subpage-page .content, .content, .papers-page-content");
        if (!sourceContent) throw new Error("The page has no content area");
        content.innerHTML = sourceContent.innerHTML;
        content.classList.add("is-subpage-content");
      }

      setActivePage(page);
      document.title = pages[page].title;
      if (settings.push) setUrl(page, false);
      window.scrollTo(0, 0);
    } catch (error) {
      content.innerHTML = '<section class="section page-load-error"><h2>Unable to load this page</h2><p>Please try again.</p></section>';
      content.classList.add("is-subpage-content");
      console.error(error);
    } finally {
      content.removeAttribute("aria-busy");
    }
  }

  navigation.addEventListener("click", function (event) {
    const link = event.target.closest("a[data-page]");
    if (!link) return;
    event.preventDefault();
    loadPage(link.dataset.page);
  });

  window.addEventListener("popstate", function (event) {
    const page = event.state && pages[event.state.page] ? event.state.page : pageFromUrl();
    loadPage(page, { push: false });
  });

  const initialPage = pageFromUrl();
  setActivePage(initialPage);
  if (initialPage !== "home") loadPage(initialPage, { push: false });
}());
