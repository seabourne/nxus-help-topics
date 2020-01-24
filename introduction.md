
[![Build Status](https://travis-ci.org/seabourne/nxus-help-topics.svg?branch=master)](https://travis-ci.org/seabourne/nxus-help-topics)

The Nxus Help Topics module provides access to Help Scout content.
In general terms, it offers two ways of retrieving help content (which
Help Scout refers to as _articles_):
-   **Help Beacons** - You can add trigger elements to your web page to
    display help topics in the Help Scout Beacon (a modal help dialog).
    You identify the help topic, and the Beacon logic handles its
    display.
-   **Topic Details** - You can retrieve the detailed data for a help
    topic. You're responsible for whatever use you want to make of the
    data. (Help topics can provide a handy place to stash material that
    isn't strictly a help topic, but benefits from being easily
    accessible for editing; welcome messages, for example.)

Here's a bit of background on how Help Scout organizes help content:
-   **Article** - As noted above, help content is referred to as an
    article; it includes the help text and related metadata, including
    the article identifier, slug and name.
-   **Collection** - Articles are grouped into collections. The Help
    Topics module provides access to the articles in a single
    collection.
-   **Article Slug** - The article slug identifies the article in
    human-readable keywords. (By default, it's a kebab-case rendering of
    the article name, but any kebab-case word sequence will do.)
-   **Article Identifier** - An opaque unique identifier for the article.

It's handy to use article slugs to designate help topics. They're
human-readable, so they give an indication of the topic. Also, you can
create slugs for help topics that aren't yet defined. However, the Help
Scout Beacon and Document APIs require article identifiers for
retrieving help topics, so there's an extra mapping step required to
retrieve an article using its slug.


## Configuration parameters

The Help Topics module accepts these configuration parameters:
*   `apiKey` - The Help Scout Docs API key used for authentication
    (see the Help Scout documentation for the
    [Docs API Key](https://developer.helpscout.com/docs-api/#your-api-key)).
*   `collectionId` - The id of the collection containing the help
    topic articles. It looks like the easiest place to find the
    collection id is in the URL for the Help Scout document library
    landing page (for example,
    `https://secure.helpscout.net/docs/5d8a195e2c7d3a7e9ae18b54/`).
*   `beaconKey` - The Help Scout Beacon key. (You can find it in the
    embed code provided by the Help Scout Beacon Builder; it's the
    second parameter in the `Beacon('init', key)` call.) Define this
    parameter if you're using the `helpscout` partial to define the
    Beacon embed code.
*   `listURL` - the Docs API List Articles endpoint and parameters
    (default `https://docsapi.helpscout.net/v1/collections/:id/articles?status=published&pageSize=100`)
*   `getURL` - the Docs API Get Article endpoint and parameters
    (default `https://docsapi.helpscout.net/v1/articles/:id`)


## Embedding the Help Scout Beacon on web pages

Displaying help topics in the Help Scout Beacon requires the Help Scout
`Beacon` object to defined in the web page context.

The Help Scout Beacon Builder provides embed code that does this.

Alternatively, the Help Topics module defines a `helpscout` partial
through `nxus-templater` that you can render to provide the embed code.
See [Use with EJS and Nxus Templater](#use-with-ejs-and-nxus-templater)
for details.


## The \<help-topic-trigger\> element

The `<help-topic-trigger>` element renders an interactive marker that,
when clicked, displays the Help Scout Beacon. The `topic` property may
be used to specify the help topic to display in the beacon; if no topic
is specified, the beacon is opened to the general help interface.

By default, the trigger element displays a FontAwesome `info-circle`
icon as the clickable element. You can specify an alternate display as
the content of the `<help-topic-trigger>` element.

### Properties

-   **`topic`**`: string`
    Article identifier for the help topic to display.

-   **`opened`**`: boolean`
    The opened/closed state of the trigger. If true, the trigger has the
    beacon open; if false, the trigger is not controlling the beacon
    (it may be closed, or open from some other cause). Setting the
    property programmatically will open or close the beacon.

### Styling

You can override these CSS variables to adjust the styling of the
trigger element:
-   `--help-topic-trigger-font-family` (default `'FontAwesome'`)
-   `--help-topic-trigger-font-size` (default `75%`)
-   `--help-topic-trigger-line-height` (default `1`)
-   `--help-topic-trigger-font` (default uses `--help-topic-trigger-font-size`,
    `--help-topic-trigger-line-height`, and `--help-topic-trigger-font-family` settings)
-   `--help-topic-trigger-color` (default `inherit`)
-   `--help-topic-trigger-color-open` (default `red`)

### Example

Here's a simple example showing a Font Awesome info-circle icon as the
trigger marker and a help topic with article id `5dc5aa4d2c7d3a7e9ae3b621`.

    <help-topic-trigger topic="5dc5aa4d2c7d3a7e9ae3b621">
      <i class="fa fa-info-circle"></i>
    </help-topic-trigger>

### Mapping article slugs to ids

Typically, help topics are indicated by article slugs, and the topic
index returned by the `HelpTopics` `getHelpTopicIndex()` method is used
to map slugs to ids.

### Defining the element

The `<help-topic-trigger>` element can be defined in page setup as
follows:

    <script src="/node_modules/nxus-help-topics/components/help-topic-trigger.js"></script>


## Use with EJS and Nxus Templater

The Help Topics module adds these properties to the templater rendering
context:
*   `beaconKey` - The Help Scout Beacon key, copied from the Help Topics
    configuration parameter.
*   `helpTopicIndex` - An associative array that maps help topic article
    slugs to article information (`id`, `slug` and `name`).

There is a `helpscout` partial that you can render to provide the embed
code. (It's an alternative to using the Help Scout Beacon Builder embed
code directly – it uses the Help Scout Beacon key from the Help Topics
`beaconKey` configuration parameter.) Place it at the end of the
contents of the page `<body>...</body>` element.

    <%- render('helpscout') %>

By default, it sets the beacon display style to `manual`, so no beacon
button will be displayed on the page. You can override this and other
configuration settings by passing a `beaconConfig` object in the
`render()` context. See the [HelpScout Beacon JavaScript API](https://developer.helpscout.com/beacon-2/web/javascript-api/)
for more information on configuration options.

You can render a trigger element with the `help-scout` partial. Provide
the article slug as the `topic` parameter. If there is no article
defined for the specified slug, the trigger is omitted.

    <%- render('help-topic', {topic: slug}) %>


## Use with React

The `clientjs/help-topic.js` module defines components for using Help
Topics within React. The `<HelpTopic>` React component creates a
`<help-topic-trigger>` element for a help topic identified by an article
slug. If there is no article defined for the specified slug, the trigger
is omitted. It relies on a React Context defined by `HelpTopicContext`
to provide a Help Topic article index (in the form returned by the
`HelpTopics` `getHelpTopicIndex()` method).

Here's an example of their use:

    import HelpTopic, {HelpTopicContext} from '.../node_modules/nxus-help-topics/clientjs/help-topic'

    class MyComponent extends React.Component {

      render() {
        return (
          <HelpTopicContext.Provider value={this.props.helpTopicIndex} >
            ...
            <HelpTopic topic="my-help-topic"/>
            ...
          </HelpTopicContext.Provider>
        )
      }

    }


## Possible issues, loose ends

The `<help-scout-trigger>` element uses ES6 module syntax. This seems to
work with webpack and Chrome, but it's not entirely clear whether this
approach is robust with other possible bundling strategies and browsers.

The `package.json` provides a `compile-elements` script that transpiles
the source file for the element. Right now, all it does is remove the
double-colon binding syntax (`::`). However, it could perform more
extensive transformations if the need for them became apparent.
