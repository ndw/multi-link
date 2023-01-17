Multi-link is a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
that supports one-to-many links in a manner that’s intended to be both
accessible and easy to use.

# TL;DR

Copy the `src/js/multi-link.js` file somewhere convenient and add it to
your web pages with a `script` element: `<script src="multi-link.js"></script>`.

Put multi-links in your content like this:

``` xml
Eat your
<multi-link link-text="vegetables" heading="Selected vegetables from Wikipedia">
<a href="https://en.wikipedia.org/wiki/Carrot">Carrots</a>,
<a href="https://en.wikipedia.org/wiki/Parsnip">Parsnips</a>, or
<a href="https://en.wikipedia.org/wiki/Leek">Leeks</a>
</multi-link>.
```

See the [examples](https://ndw.github.io/multi-link/) page.

# Background

We’re all used to writing one-to-one links, because that’s what browsers support.
You can link to the
[DocBook Wikipedia page](https://en.wikipedia.org/wiki/DocBook) if you want,
or to the [DocBook home page](https://docbook.org/), or even to
[DocBook: The Definitive Guide](https://tdg.docbook.org/), but you can’t
just have a single link from “DocBook” to any one of those pages.

Well, of course, you *can* but you’d have to write the JavaScript to
support it and you’d have to arrange for that code to be used on all
of the pages where you want to have this kind of multi-link facility.
And, if you’re a good and thoughtful web citizen, you’d want to do
that in a way that supported accessibility.
(In fact the [DocBook: xslTNG](https://xsltng.docbook.org/)
stylesheets do exactly this, but they’re starting with richer markup.)

# Using a web component

I’ve been interested in web components for a while and I had the idea
that it should be possible to have a “multi-link” component that
packages up this behavior in a way that’s easy to use. So I took a
stab at writing one.

This is my first ever web component. It’s very likely I’ve overlooked
things and made questionable design choices. I’ll improve it as I
learn things.

The way a web component works is that it defines the style and
behavior associated with a custom element. Custom elements are
elements in an HTML document with names that include a “-”. So “div”,
“p”, and “spoon” are all HTML elements (they may not all exist today,
but they might tomorrow because some future version of the HTML
specification could define them). Conversely, “my-element”,
“knife-and-fork”, and “d-iv” are all custom elements. The HTML
specification has promised never to create a standard element with a
name that includes a hyphen.

If you stick `<my-element>some text</my-element>` in your HTML
document, nothing happens. Well, that’s not strictly true. What
happens is the browser ignores the (unknown) element and renders its
content.

If you *also* give the browser a little bag of JavaScript that defines
the custom element, then your JavaScript runs to process the element.

I’m not going to try to describe precisely how all this works. Put
“writing a web component” in your favorite search engine and you’ll
get more and better tutorials than I could write at this stage.

# The multi-link web component

The `<multi-link>` web component can be added to any web page by
importing the `src/js/multi-link.js` script into your page. You can
see this in the [examples](https://ndw.github.io/multi-link/).

The `<multi-link>` element should contain a mixture of text and links
(no nested structure is supported). For accessibility purposes, you
should write the content such that it makes sense even if the
component is ignored. For example:

```
<p>Information about
<multi-link>
  <a href="https://en.wikipedia.org/wiki/DocBook">DocBook (Wikipedia)</a>
  [see also <a href="https://docbook.org/">DocBook.org</a>,
  <a href="https://tdg.docbook.org/">DocBook: The Definitive Guide</a>,
  and <a href="https://xsltng.docbook.org/">DocBook xslTNG</a>]
</multi-link>.
</p>
```

Without support for the web component, that will render in a
completely understandable way:

> Information about
> [DocBook (Wikipedia)](https://en.wikipedia.org/wiki/DocBook)
> [see also [DocBook.org](https://docbook.org/),
> [DocBook: The Definitive Guide](https://tdg.docbook.org/"),
> and [DocBook xslTNG](https://xsltng.docbook.org/).]

If the web component *is* supported, it will render as a dropdown menu
listing the three choices. Each link will be a menu choice and the
text will not be displayed.

By default, the text of the first link is used as the text which
selects the dropdown. It’s rendered as a link so readers will
recognize that it’s something to point at.

In this case, the text of that first link doesn’t work especially
well. You can override that with an attribute.

## The attributes

The `<multi-link>` component has three attributes:

<dl>
<dt>link-text</dt>
<dd>Alternate text to use as the link text.</dd>
<dt>header</dt>
<dd>A header row for the dropdown list.</dd>
<dt>width</dt>
<dd>The width of the dropdown.</dd>
</dl>

I’m not especially fond of using attribute values for human-readable
text, but in this case we have little choice because we don’t want
that text rendered if the web component is unavailable.

The component tries to work out a width for the dropdown. It works
reasonably well for languages written in a latin script. It might work
less well for other scripts, and you might just want to set the width,
so you can.

# Styling the component

Styling web components is a little tricky. They live in an isolated
world (the shadow DOM). This is important because it means that they
can be styled independent of the style of the document in which
they’re embedded. But that’s a drag if you want to style them *like*
the document in which they’re embedded!

Luckily, you can break through the barrier to make changes to the
styling. To understand how, it’s necessary to understand the markup
that the component uses. Your text is transformed into template HTML.
The body of that template looks like this:

``` xml
<span class="inline"><slot></slot></span>
<span class="linkmenu" part="linkmenu">
  <a href="#" class="linktext" part="linktext"></a>
  <span class="dropdown" part="dropdown">
    <span class="heading" part="heading"></span>
    <span class="link" part="link"></span>
  </span>
</span>
```

The first `span` that contains the `slot` is where your content enters
the component. That inline is set to `display: none` by the component
and its content is copied into the template that follows. Using the
example above, the markup that renders the dropdown is:

``` xml
<span class="linkmenu" part="linkmenu">
  <a href="#" class="linktext" part="linktext">DocBook (Wikipedia)</a>
  <span class="dropdown" part="dropdown">
    <span class="heading" part="heading"></span>
    <span class="link" part="link">
      <a part="anchor" href="https://en.wikipedia.org/wiki/DocBook">DocBook (Wikipedia)</a>
    </span>
    <span class="link" part="link">
      <a part="anchor" href="https://docbook.org/">DocBook.org</a>
    </span>
    <span class="link" part="link">
      <a part="anchor" href="https://tdg.docbook.org/">DocBook: The Definitive Guide</a>
    </span>
    <span class="link" part="link">
      <a part="anchor" href="https://xsltng.docbook.org/">DocBook xslTNG</a>
    </span>
  </span>
</span>
```

You can use the `::part()` selector to reach into the structure.

Take the “movies” list from
[examples](https://ndw.github.io/multi-link/#movies) page. It’s identified with
`<multi-link class='movies'>`. So we can style links in the dropdown with:

``` css
multi-link.movies::part(link) {
    color: green;
}
```

That part name, `link` in `::part(link)`, corresponds to the `part="link"` attributes in
the template.

Note that `::part()` selectors are terminal, you can’t style the `a`
elements inside them by writing:

``` css
multi-link.movies::part(linktext) a { … }
```

That won’t work. That’s why I put `anchor` parts on the anchors.

# Caveats

It works on mobile, but it’s not easy to reposition the screen if the
dropdown oveflows. I’m not sure how best to fix that.
