class MultiEndedLink extends HTMLElement {
  static observedAttributes = ['link-text', 'heading', 'width']

  constructor() {
    super();

    this.props = {};

    /*
    <template>
      <style></style>
      <span class="inline"><slot></slot></span>
      <span class="linkmenu" part="linkmenu">
        <a href="#" class="linktext" part="linktext"></a>
        <span class="dropdown" part="dropdown">
          <span class="heading" part="heading"></span>
          <span class="link" part="link"></span>
        </span>
      </span>
    </template>
    */

    const makeSpan = function(part) {
      const span = document.createElement("span");
      span.setAttribute("class", part);
      span.setAttribute("part", part);
      return span;
    };

    const template = document.createDocumentFragment();
    const style = document.createElement("style");
    style.innerHTML = `.inline {
    display: inline;
}
.linkmenu {
    display: none;
}
.linktext {
  cursor: pointer;
}
.dropdown {
  display: none;
  position: absolute;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  background-color: white;
  z-index: 1;
  overflow-x: scroll;
}
.dropdown .heading {
  background-color: rgba(0, 0, 0, .1);
  color: black;
  font-family: sans-serif;
}
.dropdown span {
  padding: 0.5em 1.5em;
  display: block;
}
.dropdown span:hover {
  background-color: rgba(0, 0, 255, .1);
}
.dropdown span.heading:hover {
  background-color: rgba(0, 0, 0, .1);
}
.linkmenu:hover .dropdown {
  display: block;
}
.linkmenu:hover .linktext {
  background-color: rgba(0, 0, 255, .1);
}
a, a:visited {
  color: inherit;
}`;
    template.appendChild(style);

    let span = makeSpan("inline");
    span.appendChild(document.createElement("slot"));
    template.appendChild(span);

    const linkmenu = makeSpan("linkmenu");
    const anchor = document.createElement("a");
    anchor.setAttribute("href", "#");
    anchor.setAttribute("class", "linktext");
    anchor.setAttribute("part", "linktext");
    linkmenu.appendChild(anchor);
    template.appendChild(linkmenu);

    span = makeSpan("dropdown");
    span.appendChild(makeSpan("heading"));
    span.appendChild(makeSpan("link"));
    linkmenu.appendChild(span);

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.append(template);
  }

  connectedCallback() {
    const approximateWidth = function(input) {
      // Capital letters = 1, marks = 0, everything else = 0.5
      let width = 0.0;
      for (let pos = 0; pos < input.length; pos++) {
        if (input[pos].match(/\p{Lu}/u)) {
          width += 1.0;
        } else if (!input[pos].match(/\p{M}/u)) {
          width += 0.5;
        }
      }
      return width;
    };

    let slots = this.shadowRoot.querySelectorAll('slot');
    slots[0].addEventListener('slotchange', event => {
      const inline = this.shadowRoot.querySelector(".inline");
      const linkmenu = this.shadowRoot.querySelector(".linkmenu");
      const linktext = this.shadowRoot.querySelector(".linktext");
      const dropdown = linkmenu.querySelector(".dropdown");

      let maxwidth = 0;
      const headspan = this.shadowRoot.querySelector(".heading");
      if (this.props["heading"]) {
        headspan.innerHTML = this.props["heading"];
        maxwidth = approximateWidth(headspan.innerHTML.toString());
      } else {
        headspan.style.display = "none";
      }

      let linkspan = dropdown.querySelector(".link");
      slots[0].assignedNodes().forEach(node => {
        if (node.tagName === 'A') {
          if (linkspan == null) {
            linkspan = document.createElement("span");
            linkspan.setAttribute("part", "link");
            linkspan.setAttribute("class", "link");
            dropdown.appendChild(linkspan);
          }
          const anchor = node.cloneNode(true);
          anchor.setAttribute("part", "anchor");
          linkspan.appendChild(anchor);

          maxwidth = Math.max(maxwidth, 
                              approximateWidth(anchor.innerHTML.toString()));

          if (!this.props["link-text"]) {
            this.props["link-text"] = node.innerHTML;
          }

          linkspan = null;
        }
      });

      if (this.props["width"]) {
        dropdown.style.width = this.props["width"];
      } else {
        // Try to work out reasonable min/max
        if (maxwidth+3 < 40) {
          dropdown.style.width = `${maxwidth+3}em`;
        } else {
          dropdown.style.width = "43em";
        }
      }

      linktext.innerHTML = this.props["link-text"];
      linktext.addEventListener('click', event => {
        event.preventDefault();
      });

      inline.style.display = "none";
      linkmenu.style.display = "inline-block";
      linkmenu.style.position = "relative";
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.props[name] = newValue;
  }
}

// init the element
customElements.define("multi-link", MultiEndedLink);
