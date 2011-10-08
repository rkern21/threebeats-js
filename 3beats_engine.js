var LoadJQuery = function(callback) {
    var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;

    var script = document.createElement('script');
    script.async = "async";
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js";
    script.onload = script.onreadystatechange = function() {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            $(document).ready(callback);
        }
    };

    head.appendChild(script);
};

LoadJQuery(function() {
    const DATA_SERVER_NAME = "http://sports.3beats.com/wp-content/plugins/threebeats-js/";

    const URL_WHITELIST = 	DATA_SERVER_NAME + "popup/whitelist.php?callback=?";
    const URL_STARFILE = 	DATA_SERVER_NAME + "popup/starfile.php?callback=?";
    const ICON_STAR = 		DATA_SERVER_NAME + "inject/images/3beats-star-16x16.png";
    const JS_POPUP = 		DATA_SERVER_NAME + "inject/popup.js";
    const JS_JPOPUP = 		DATA_SERVER_NAME + "inject/jpopup.js";
    const CSS_POPUP = 		DATA_SERVER_NAME + "inject/threebeats_popup.css";
	const POPUP_HTML =		DATA_SERVER_NAME + "inject/popup.html";

    var ArrayUtils = {
        contains : function(arr, e) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == e) {
                    return true;
                }
            }

            return false;
        }
    };

    var WhiteList = {
        rules : [],
        isReady : false,

        testDomain : function(domain) {
            with (WhiteList) {
                for (var i = 0; i < rules.length; i++) {
                    var r = rules[i];

                    if (r.site.test(domain)) {
                        return r;
                    }
                }
            }
        },
        
        _convertToRegexp : function(w) {
            return new RegExp(w.replace(/\*/g, ".*"));
        }
    };

    $.getJSON(URL_WHITELIST, function(data) {
        WhiteList.rules = data;
        for (var i = 0; i < WhiteList.rules.length; i++) {
            WhiteList.rules[i].site = WhiteList._convertToRegexp(WhiteList.rules[i].site);
        }
        WhiteList.isReady = true;
    });

    var Highlighter = {
        names : [],
        isReady : false,

        highlightDoc : function(rule) {
            var matches = Highlighter._highlightImpl(rule);

            if (matches > 0) {
                Injector.injectPopupCode();
            }
        },

        _hasParentTag : function(element, tagName) {
            if (element == null || element.parentNode == null || element.parentNode.tagName == null) {
                return false;
            }

            if (element.parentNode.tagName.toLowerCase() == tagName.toLowerCase()) {
                return true;
            }

            return Highlighter._hasParentTag(element.parentNode, tagName);
        },

        _highlightImpl : function(rule) {
            var matches = 0;
            var h1Nodes = [];
            var h2Nodes = [];
            var h3Nodes = [];
            var highlightedNames = [];

            function highlightNode(node, starName, pos) {

                var middlebit = node.splitText(pos);
                var endbit = middlebit.splitText(starName.length);
                var middleclone = middlebit.cloneNode(true);

                var linkNode = $('<i title="threeBeatsExtPopup" style="color: blue;text-decoration: underline;cursor: pointer;">' + middleclone.data + '</i>')[0];
                middlebit.parentNode.replaceChild(linkNode, middlebit);

                var img = $('<img src="' + ICON_STAR + '" border="0">')[0];
                if (linkNode.nextSibling) {
                    linkNode.parentNode.insertBefore(img, linkNode.nextSibling);
                } else {
                    linkNode.parentNode.appendChild(img);
                }

                highlightedNames.push(starName);
            }

            function innerHighlight(node) {
                var nodeText = node.data.toLowerCase();

                for (var i = 0; i < Highlighter.names.length; i++) {
                    var starName = Highlighter.names[i];

                    if (ArrayUtils.contains(highlightedNames, starName)) {
                        continue;
                    }

                    var pos = nodeText.indexOf(starName);
                    if (pos >= 0) {
                        if (Highlighter._hasParentTag(node, "h1")) {
                            h1Nodes.push({ node : node.parentNode, pos : pos, name : starName});
                        } else if (Highlighter._hasParentTag(node, "h2")) {
                            h2Nodes.push({ node : node.parentNode, pos : pos, name : starName});
                        } else if (Highlighter._hasParentTag(node, "h3")) {
                            h3Nodes.push({ node : node.parentNode, pos : pos, name : starName});
                        } else if (Highlighter._hasParentTag(node, "h4")) {
                            // Do nothing. Disable H4 highlighting.
                        } else {
                            highlightNode(node, starName, pos);
                            matches++;
                        }

                        break;
                    }
                }
            }

            function highlightHeaders(headersArr) {
                var result = false;
                for (var i = 0; i < headersArr.length; i++) {
                    var e = headersArr[i];

                    highlightNode(e.node, e.name, e.pos);
                    matches++;

                    result = true;
                }

                return result;
            }

            function trim(string) {
                return string.replace(/(^\s+)|(\s+$)/g, "");
            }

            function collectTextNodes(element, exclusions, texts) {

                if (element.tagName == "SCRIPT" || element.tagName == "STYLE" || element.tagName == "IMG") {
                    return;
                }

                for (var child = element.firstChild; child !== null; child = child.nextSibling) {
					if (child.nodeType === 3) {
                        var cleared = trim(child.data);
                        if (cleared != "") {
                            texts.push(child);
                        }
                    } else if (child.nodeType === 1)
						if (!ArrayUtils.contains(exclusions, child)) {
                           collectTextNodes(child, exclusions, texts);
                        }
                }
            }

            function selectSingleNode(elementPath) {
                try {
                    var links = document.evaluate(elementPath, document, null, XPathResult.ANY_TYPE, null);

                    return links.iterateNext();
                } catch(e) {
                    return null;
                }
            }
            var articleNode = selectSingleNode(rule.start);

            var exclusions = [];

            if (rule.exclude) {
                for (var i = 0; i < rule.exclude.length; i++) {
                    var node = selectSingleNode(rule.exclude[i]);

                    if (node) {
                        exclusions.push(node);
                    }
                }
            }

            var texts = [];

            if (articleNode) {
                collectTextNodes(articleNode, exclusions, texts);
            } else {
				collectTextNodes(document.body, exclusions, texts);
            }
            for (var i = 0; i < texts.length; i++) {
				innerHighlight(texts[i]);
            }

            if (matches == 0) {
                if (highlightHeaders(h3Nodes)) {
                    return matches;
                }
                if (highlightHeaders(h2Nodes)) {
                    return matches;
                }

                highlightHeaders(h1Nodes);
            }

            return matches;
        }
    };

    $.getJSON(URL_STARFILE, function(data) {
        Highlighter.names = [];
        $.each(data, function(i, name){
            Highlighter.names.push(name.toLowerCase());
        });

        Highlighter.isReady = true;
    });

    var Injector = {
        invalidURL : [
            /\.pdf$/,
            /\.md$/,
            /\.txt$/,
            /\.js$/,
            /\.css$/,
            /\.as$/,
            /\.mx$/,
            /\.cs$/,
            /\.ps$/,
            /\.properties$/,
            /\.sql$/,
            /\.tex$/,
            /\.vb$/,
            /\.vbs$/,
            /\.xml$/,
            /\.xsml$/,
            /\.xsl$/,
            /\.xsd$/,
            /\.kml$/,
            /\.wsdl$/,
            /\.jpg$/,
            /\.gif$/,
            /\.png$/,
            /content-type=text\/plain/,
            /^view-source:/,
            /^chrome:/,
            /^about:/
        ],

        isSupportedUrl : function (url) {
            with (Injector) {
                for (var i = 0; i < invalidURL.length; i++) {
                    if (url.search(invalidURL[i]) != -1) {
                        return false;
                    }
                }

                return true;
            }
        },

        injectPopupCode : function() {
            Injector._injectCSS();
            Injector._injectPopupScripts();
        },

        _injectPopupScripts : function() {
            $("head").append($('<script type="text/javascript" src="' + JS_JPOPUP + '"></script>'));

            $.get(POPUP_HTML, function(html){
                var script = "window.popupHTML = '" + html.replace(/\r?\n/g, "\\\n").replace(/'/g, "\\'") + "';";
                $("head").append('<script>' + script + '</script>');
                $("head").append('<script src="' + JS_POPUP + '"></script>');
            });
        },

        _injectCSS : function() {
            $("head").append($('<link rel="stylesheet" href="' + CSS_POPUP + '" type="text/css"/>'));
        }
    };

    (function start() {
        if (!Highlighter.isReady || !WhiteList.isReady) {
            setTimeout(start, 100);
            return;
        }

        var url = document.location.toString();

        var rule = WhiteList.testDomain(url);

        if (rule && Injector.isSupportedUrl(url)) {
            Highlighter.highlightDoc(rule);
        }
    })();
});