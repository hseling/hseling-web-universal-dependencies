# ud-annotatrix

The online interface is currently available from several places:

* [Jonathan's GitHub pages](https://jonorthwash.github.io/ud-annotatrix/) - latest code of main repo.
* [Masha's GitHub pages](https://maryszmary.github.io/ud-annotatrix/standalone/annotator.html).
* [Fran's GitHub pages](https://ftyers.github.io/ud-annotatrix/).
* [Server version on web-corpora](http://web-corpora.net/wsgi3/annotatrix/)(beta).
* [Jonathan's alternate GitHub pages](https://jonorthwash.github.io/visualiser.html) - synchronised to v0.1.3, a late version of just the visualiser code.

To use it offline, clone this repository to your local machine and open the file `index.html` in your browser.

Alternatively, you can serve the files using a web server.  An easy way to do this locally is to run `python3 -m http.server` in the cloned directory.

## Support

Having a problem with Annotatrix ? Want some one-on-one support ? You can try <tt>#_u-dep</tt> on <tt>irc.freenode.net</tt> or
join our [Telegram chat](https://t.me/joinchat/EWWgMhGXARzxvgO5AzI0ew).

## About

### The idea

UD Annotatrix is a client-side, browser only, tool for editting dependency trees in [CoNLL-U](http://universaldependencies.org/format.html) and [VISL](http://beta.visl.sdu.dk/cg3/single/#streamformats) formats.  The point of this is to make manual editing of dependency corpora quicker. The aim of this project is to create an easy-to-use, quick and interactive interface tool for Universal Dependencies annotation, which would work both online and offline and allow the user to edit the annotation in both graphical and text modes.

Note that something similar exists in [brat](http://brat.nlplab.org), but that we're aiming for a simpler, cleaner, faster interface optimised for Universal Dependencies with an optional server-side component.

### Functionality

At the moment, the interface supports:
* draw dependencies between tokens
* edit dependency relations
* delete dependencies
* edit POS labels
* edit tokens

Editing POS labels, editing deprels, drawing arcs and deleting arcs are undoable and redoable.

The interface supports right-to-left readin order and vertical alignment for long sentences.

### Development

When developing, make sure you have the most recent versions of all source files and dependencies by running `git pull && npm install`.

After making changes, make sure to recompile the JavaScript and HTML with `npm run build`.  Alternatively, running `npm run build-watch` will build the application and listen for changes.

### Modes

The UD-Annotatrix tool can be run with or without a server backend.  To use the server backend, run `npm install` before executing any other commands.  This assumes you have a working installation of `node` and `npm`.  To verify this is the case, run `node -v`.

Note: running without a server does not require this step.

A comparison of each different mode is given by this table:

|     mode     |    how to start      | how to access |  features   | limitations |
|--------------|----------------------|---------------|-------------|-------------|
| local server | `npm run dev-server` | `http://localhost:5316/annotatrix` | collaborative editing |             |
| remote server| `npm run server`     | `http://<host>:5316/annotatrix` | collaborative editing |             |
| remote server - heroku |                      |               |              |             |
| local fs     |                      | `file:///<path>/index.html` |  | no database, no GitHub integration, no collaborative editing |
| serve locally| `python3 -m http.server` | `http://localhost/ud-annotatrix/` |  | no database, no GitHub integration, no collaborative editing |
| `github.io`  |                      | `https://<username>.github.io/ud-annotatrix/` |  | no database, no GitHub integration, no collaborative editing |

### Configuring

Change values in `config.js` and `.env` to adjust port, etc.

## User guide

The basic user guide is available on the [help page](https://maryszmary.github.io/ud-annotatrix/standalone/help.html).

## Architecture and components


### Standalone

The standalone part of the project is written in JavaScript. The standalone version supports full functionality, apart from saving corpora on server.

#### Project architecture

* main managing script: `annotator.js`
* support for visualisation: `visualiser.js`, `cy-style.js`
* support for graphical editing: `gui.js`
* format handling: `converters.js`, `CG2conllu.js`

#### Dependencies

* jQuery
* Cytoscape
* head.js
* undomanager.js
* a JS library for parsing conllu written by Magdalena Parks

All the dependencies are stored in ./standalone/lib/ext/.

#### Tests

Currently, there are only tests for CG3 to CoNLL-U converters.

### Server

The server package provides additional support for deploying the web-interface on a web-server. The back-end is written Python 3, Flask.

#### Dependencies

* Flask

## Acknowledgements

If you use Annotatrix in your work, please cite:

```
@inproceedings{tyers-etal:2018,
  author = {Francis M. Tyers and Mariya Sheyanova and Jonathan North Washington},
  title = {UD Annotatrix: An annotation tool for Universal Dependencies},
  booktitle ={Proceedings of the 16th International Workshop on Treebanks and Linguistic Theories (TLT16)},
  pages = {10--17},
  year = 2018
}
```

## Contributors

* Jonathan North Washington (@jonorthwash)
* Mariya Sheyanova (@maryszmary; [documentation of the changes](http://wiki.apertium.org/wiki/UD_annotatrix/UD_annotatrix_at_GSoC_2017))
* Tai Vongsathorn Warner (@MidasDoas; [documentation of the changes](https://wikis.swarthmore.edu/ling073/User:Twarner2/Final_project))
* Francis Tyers (@ftyers)
* Grzegorz Stark (@gstark0)
* Jonathan Pan (@JPJPJPOPOP)
* Suresh Michael Peiris (@tsuresh)
* Diogo Fernandes (@diogoscf)
* Robin Richtsfeld (@Androbin)
* Sushain Cherivirala (@sushain97)
* Kevin Brubeck Unhammer (@unhammer)
* Ethan Yang (@thatprogrammer1)
