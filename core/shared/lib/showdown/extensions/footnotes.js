// Adds footnote syntax as per Markdown Extra:
//
// https://michelf.ca/projects/php-markdown/extra/#footnotes
//
// That's some text with a footnote.[^1]
//
// [^1]: And that's the footnote.
//
//     That's the second paragraph.
//
// Also supports [^n] if you don't want to worry about preserving
// the footnote order yourself.

(function () {
    var footnotes = function () {
        return [
            { type: 'lang', filter: function(text) {
                var preExtractions = {},
                    hashID = 0;

                function hashId() {
                    return hashID++;
                }

                // Extract pre blocks
                text = text.replace(/```[\s\S]*?\n```/gim, function (x) {
                    var hash = hashId();
                    preExtractions[hash] = x;
                    return "{gfm-js-extract-pre-" + hash + "}";
                }, 'm');

                // Inline footnotes e.g. "foo[^1]"
                var i = 0;
                var inline_regex = /\[\^(\d|n)\](?!:)/g;
                text = text.replace(inline_regex, function(match, n) {
                    // We allow both automatic and manual footnote numbering
                    if (n == "n") n = i+1;

                    var s = '<sup id="fnref:'+n+'">' +
                              '<a href="#fn:'+n+'" rel="footnote">'+n+'</a>' +
                            '</sup>';
                    i += 1;
                    return s;
                });

                // Expanded footnotes at the end e.g. "[^1]: cool stuff"
                var end_regex = /\[\^(\d|n)\]: ([\s\S]*?)\n(?!    )/g;
                var m = text.match(end_regex);
                var total = m ? m.length : 0;
                var i = 0;

                text = text.replace(end_regex, function(match, n, content) {
                    if (n == "n") n = i+1;

                    content = content.replace(/\n    /g, "<br>");

                    var s = '<li class="footnote" id="fn:'+n+'">' +
                              '<p>'+content+'<a href="#fnref:'+n +
                                '" title="return to article"> ↩</a>' +
                              '</p>' +
                            '</li>'

                    if (i == 0) {
                        s = '<div class="footnotes"><ol>' + s;
                    }

                    if (i == total-1) {
                        s = s + '</ol></div>'
                    }

                    i += 1;
                    return s;
                });

                // replace extractions
                text = text.replace(/\{gfm-js-extract-pre-([0-9]+)\}/gm, function (x, y) {
                    return preExtractions[y];
                });

                return text;
            }}
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.footnotes = footnotes;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = footnotes;
    }
}());

