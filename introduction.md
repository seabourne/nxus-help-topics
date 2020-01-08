
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

## Embedding the Help Scout Beacon on web pages

The Help Scout Beacon Builder provides embed code that defines the
`Beacon` object in the context of a web page.

Alternatively, the Help Topics module defines a `helpscout` partial that
you can render to provide the embed code. Place it at the end of the
contents of the page `<body>...</body>` element. You'll need to define
the `beaconKey` configuration parameter to use this.

    <%- render('helpscout') %>


## The <help-topic-trigger> element

The `help-topic-trigger` element renders an interactive marker that,
when clicked, displays the Help Scout Beacon. The element content
provides the marker. The `topic` property may be used to specify the
help topic to display in the beacon; if no topic is specified, the
beacon is opened to the general help interface.

### Properties

-   **`topic`**`: string`
    Article identifier for the help topic to display.

-   **`opened`**`: boolean`
    The opened/closed state of the trigger. If true, the trigger has the
    beacon open; if false, the trigger is not controlling the beacon
    (it may be closed, or open from some other cause). Setting the
    property programmatically will open or close the beacon.

### Example

Here's a simple example showing a Font Awesome info-circle icon as the
trigger marker and a help topic with article id `5dc5aa4d2c7d3a7e9ae3b621`.

    <help-topic-trigger topic="5dc5aa4d2c7d3a7e9ae3b621">
      <i class="fa fa-info-circle"></i>
    </help-topic-trigger>

### Mapping article slugs to ids

Typically, help topics are indicated by article slugs, and the topic
index returned by the `HelpTopics` `getHelpTopics()` method is used to
map slugs to ids.

This code fragment gives the general idea.

    let topics = await helpTopics.getHelpTopics()

    function getHelpTopicId(slug) {
      let topic = topics.find(topic => (topic.slug == slug))
      return topic && topic.id
    }

