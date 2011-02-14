/**
 * Created by iacob.campia@gmail.com.
 * Date: 2/14/11
 * Time: 9:55 AM
 */
(function() {

    var cache = {
        hashes : {
            classes : new Array(0),
            interfaces : new Array(0)
        }
    };

    var jClass = function(obj) {
        if (typeof obj !== "undefined") {
            var cls = function() {

            };
            return cls;
        }
    };

    jClass.config = {
        librariesPath : '/libraries/',
        id : 0
    };

    /**
     * Construct and validate a jInterface
     * @param cls Interface body
     */
    jClass.interface = function(cls) {
        var interface = {};
        for(var method in cls) {
            var type = typeof(cls[method]);
            var args = Array(0);
            if (type == "function") {
                if (cls[method] == Number) {
                    type = "number";
                } else if (cls[method] == String) {
                    type = "string";
                } else if (cls[method] == String) {
                    type = "string";
                } else if (cls[method] == Boolean) {
                    type = "boolean";
                } else if (cls[method] == Array) {
                    type = "array";
                } else {
                    var body = jUtils.getBody(cls[method]);
                    if (body.match(/function[ ]{0,}\([a-zA-Z0-9$, ]{0,}\)[ ]{0,}\{[ ]{0,}\}/i)) {
                        var tmp = body.replace(/function\s*|\s*{[\s\S]*/g, "").match(/(\w*\s*)\(([^\)]*)\)/)[2];
                        if (tmp) {
                            args = tmp.split(", ");
                        }
                    } else {
                        throw new Error("Interface must not implement a method body (on method: " + method + ")")
                    }
                }
            } else {
                throw new Error("Interface property `" + method + "` can't have a value. Define it using a type instead of a value (eg " + method + " : " + type[0].toUpperCase() + type.substr(1) + ")")
            }
            interface[method] = args.length ? [type, args] : [type];
        }
        var interfaceHash = jUtils.classHash(jUtils.serialize(interface));
        cache.hashes.interfaces[interfaceHash] = interface;

        var result = function() { throw new Error("An interface cannot be instantiated!"); };
        result.hash = interfaceHash;
        result.type = "jInterface";

        return result
    };
    
    jClass.extend = function(cls) {

    };

    jClass.implement = function(interface) {

    };

    jClass.use = function(namespace) {

    };

    jClass.require = function(script) {
        
    };

    var jUtils = {

        /**
         * Returns the body of the specified argument function
         * @param fct Function
         * @return string
         */
        getBody : function(fct) {
            if (typeof fct === "undefined") return ";";
            if (typeof fct.toSource == "function") {
                return fct.toSource().replace(/(^\()(.*)(\))$/, "$2");
            } else {
                return fct.toString().replace("\n/g", "");
            }
        },

        /**
         * Returns an array with the argument names of the function the method is in
         * @return array
         */
        getArguments : function() {
            for (var oCaller = arguments.callee.caller; oCaller !== null; oCaller = oCaller.caller) {
                var asCaller = (oCaller+"").replace(/function\s*|\s*{[\s\S]*/g, "").match(/(\w*\s*)\(([^\)]*)\)/);
                if (oCaller == arguments.callee.caller) {
                    if (asCaller.length) {
                        return asCaller[2].split(', ');
                    }
                }
            }
            return [];
        },

        /**
         * Checks if the instantiated object this method is called from is an instance of the given jClass
         * @param cls jClass class
         * @return boolean
         */
        isInstanceOf : function(cls) {
            return false;
        },

        /**
         * Checks if the instantiated object this method is called from is an implementation of the given interface
         * @param interface jInterface
         * @return boolean
         */
        isImplementationOf : function(interface) {
            return false;
        },

        /**
         * Returns a clone of the object this method is called from
         * @return jClass instance
         */
        clone : function() {
            return {}
        },

        /**
         * Generates a md5 hash tag for the given string
         * @param obj String
         */
        classHash : function(obj) {
            function hexmd(s) { return strToHex(rstrmd(strToUtf(s))); }
            function rstrmd(s) { return binToStr(binMd(strToBin(s), s.length * 8)); }
            function bitRol(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
            function cmnMd(q, a, b, x, s, t) {  return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s),b);}
            function ffMd(a, b, c, d, x, s, t) { return cmnMd((b & c) | ((~b) & d), a, b, x, s, t); }
            function ggMd(a, b, c, d, x, s, t) { return cmnMd((b & d) | (c & (~d)), a, b, x, s, t); }
            function hhMd(a, b, c, d, x, s, t) { return cmnMd(b ^ c ^ d, a, b, x, s, t); }
            function iiMd(a, b, c, d, x, s, t) { return cmnMd(c ^ (b | (~d)), a, b, x, s, t); }

            function strToHex(input) {
                var hex = "0123456789ABCDEF", output = "", x;
                for(var i = 0; i < input.length; i++) { x = input.charCodeAt(i); output += hex.charAt((x >>> 4) & 0x0F) + hex.charAt(x & 0x0F);}
                return output;
            }

            function strToUtf(input) {
                var output = "", i = -1, x, y;
                while(++i < input.length) {
                    x = input.charCodeAt(i);
                    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                        x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                        i++;
                    }
                    if(x <= 0x7F) output += String.fromCharCode(x);
                    else if(x <= 0x7FF) output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F), 0x80 | ( x         & 0x3F));
                    else if(x <= 0xFFFF) output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F), 0x80 | ((x >>> 6 ) & 0x3F), 0x80 | ( x         & 0x3F));
                    else if(x <= 0x1FFFFF) output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3F), 0x80 | ((x >>> 6 ) & 0x3F), 0x80 | ( x         & 0x3F));
                }
                return output;
            }

            function strToBin(input) {
                var output = Array(input.length >> 2);
                for(var i = 0; i < output.length; i++) output[i] = 0;
                for(var j = 0; j < input.length * 8; j += 8) output[j>>5] |= (input.charCodeAt(j / 8) & 0xFF) << (j%32);
                return output;
            }

            function binToStr(input) {
                var output = "";
                for(var i = 0; i < input.length * 32; i += 8) output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
                return output;
            }

            function binMd(x, len) {
                x[len >> 5] |= 0x80 << ((len) % 32);
                x[(((len + 64) >>> 9) << 4) + 14] = len;
                var a =  1732584193, b = -271733879, c = -1732584194, d =  271733878;

                for(var i = 0; i < x.length; i += 16) {
                    var a1 = a, b1 = b, c1 = c, d1 = d;
                    a = ffMd(a, b, c, d, x[i+ 0], 7 , -680876936);  d = ffMd(d, a, b, c, x[i+ 1], 12, -389564586);
                    c = ffMd(c, d, a, b, x[i+ 2], 17,  606105819);  b = ffMd(b, c, d, a, x[i+ 3], 22, -1044525330);
                    a = ffMd(a, b, c, d, x[i+ 4], 7 , -176418897);  d = ffMd(d, a, b, c, x[i+ 5], 12,  1200080426);
                    c = ffMd(c, d, a, b, x[i+ 6], 17, -1473231341); b = ffMd(b, c, d, a, x[i+ 7], 22, -45705983);
                    a = ffMd(a, b, c, d, x[i+ 8], 7 ,  1770035416); d = ffMd(d, a, b, c, x[i+ 9], 12, -1958414417);
                    c = ffMd(c, d, a, b, x[i+10], 17, -42063);      b = ffMd(b, c, d, a, x[i+11], 22, -1990404162);
                    a = ffMd(a, b, c, d, x[i+12], 7 ,  1804603682); d = ffMd(d, a, b, c, x[i+13], 12, -40341101);
                    c = ffMd(c, d, a, b, x[i+14], 17, -1502002290); b = ffMd(b, c, d, a, x[i+15], 22,  1236535329);
                    a = ggMd(a, b, c, d, x[i+ 1], 5 , -165796510);  d = ggMd(d, a, b, c, x[i+ 6], 9 , -1069501632);
                    c = ggMd(c, d, a, b, x[i+11], 14,  643717713);  b = ggMd(b, c, d, a, x[i+ 0], 20, -373897302);
                    a = ggMd(a, b, c, d, x[i+ 5], 5 , -701558691);  d = ggMd(d, a, b, c, x[i+10], 9 ,  38016083);
                    c = ggMd(c, d, a, b, x[i+15], 14, -660478335);  b = ggMd(b, c, d, a, x[i+ 4], 20, -405537848);
                    a = ggMd(a, b, c, d, x[i+ 9], 5 ,  568446438);  d = ggMd(d, a, b, c, x[i+14], 9 , -1019803690);
                    c = ggMd(c, d, a, b, x[i+ 3], 14, -187363961);  b = ggMd(b, c, d, a, x[i+ 8], 20,  1163531501);
                    a = ggMd(a, b, c, d, x[i+13], 5 , -1444681467); d = ggMd(d, a, b, c, x[i+ 2], 9 , -51403784);
                    c = ggMd(c, d, a, b, x[i+ 7], 14,  1735328473); b = ggMd(b, c, d, a, x[i+12], 20, -1926607734);
                    a = hhMd(a, b, c, d, x[i+ 5], 4 , -378558);     d = hhMd(d, a, b, c, x[i+ 8], 11, -2022574463);
                    c = hhMd(c, d, a, b, x[i+11], 16,  1839030562); b = hhMd(b, c, d, a, x[i+14], 23, -35309556);
                    a = hhMd(a, b, c, d, x[i+ 1], 4 , -1530992060); d = hhMd(d, a, b, c, x[i+ 4], 11,  1272893353);
                    c = hhMd(c, d, a, b, x[i+ 7], 16, -155497632);  b = hhMd(b, c, d, a, x[i+10], 23, -1094730640);
                    a = hhMd(a, b, c, d, x[i+13], 4 ,  681279174);  d = hhMd(d, a, b, c, x[i+ 0], 11, -358537222);
                    c = hhMd(c, d, a, b, x[i+ 3], 16, -722521979);  b = hhMd(b, c, d, a, x[i+ 6], 23,  76029189);
                    a = hhMd(a, b, c, d, x[i+ 9], 4 , -640364487);  d = hhMd(d, a, b, c, x[i+12], 11, -421815835);
                    c = hhMd(c, d, a, b, x[i+15], 16,  530742520);  b = hhMd(b, c, d, a, x[i+ 2], 23, -995338651);
                    a = iiMd(a, b, c, d, x[i+ 0], 6 , -198630844);  d = iiMd(d, a, b, c, x[i+ 7], 10,  1126891415);
                    c = iiMd(c, d, a, b, x[i+14], 15, -1416354905); b = iiMd(b, c, d, a, x[i+ 5], 21, -57434055);
                    a = iiMd(a, b, c, d, x[i+12], 6 ,  1700485571); d = iiMd(d, a, b, c, x[i+ 3], 10, -1894986606);
                    c = iiMd(c, d, a, b, x[i+10], 15, -1051523);    b = iiMd(b, c, d, a, x[i+ 1], 21, -2054922799);
                    a = iiMd(a, b, c, d, x[i+ 8], 6 ,  1873313359); d = iiMd(d, a, b, c, x[i+15], 10, -30611744);
                    c = iiMd(c, d, a, b, x[i+ 6], 15, -1560198380); b = iiMd(b, c, d, a, x[i+13], 21,  1309151649);
                    a = iiMd(a, b, c, d, x[i+ 4], 6 , -145523070);  d = iiMd(d, a, b, c, x[i+11], 10, -1120210379);
                    c = iiMd(c, d, a, b, x[i+ 2], 15,  718787259);  b = iiMd(b, c, d, a, x[i+ 9], 21, -343485551);
                    a = safeAdd(a, a1); b = safeAdd(b, b1); c = safeAdd(c, c1); d = safeAdd(d, d1);
                }
                return Array(a, b, c, d);
            }
            function safeAdd(x, y) { var lsw = (x & 0xFFFF) + (y & 0xFFFF); return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xFFFF); }

            return hexmd(obj);
        },

        /**
         * Parses a string and encodes all special characters to literal ones
         * @param sString
         * @return string
         */
        stringEncode : function(sString) {
            return (sString+"").replace(/[\0-\x1F\"\\\x7F-\xA0\u0100-\uFFFF]/g, function (sChar) {
                switch (sChar) {
                    case "\b": return "\\b";
                    case "\t": return "\\t";
                    case "\n": return "\\n";
                    case "\f": return "\\f";
                    case "\r": return "\\r";
                    case "\\": return "\\\\";
                    case "\"": return "\\\"";
                }
                var iChar = sChar.charCodeAt(0);
                if (iChar < 0x10) return "\\x0" + iChar.toString(16);
                if (iChar < 0x100) return "\\x" + iChar.toString(16);
                if (iChar < 0x1000) return "\\u0" + iChar.toString(16);
                return "\\u" + iChar.toString(16);
            });
        },

        /**
         * Returns a JSON representation for the input object
         * @param xValue Object
         * @return string
         */
        serialize : function(xValue) {
            switch (typeof(xValue)) {
                case "undefined": return "void(0)";
                case "boolean":   return xValue.toString();
                case "number":    return xValue.toString();
                case "string":    return "\"" + jUtils.stringEncode(xValue) + "\"";
                case "function":  return "eval(\"" + jUtils.stringEncode(xValue.toString()) + "\")";
                case "object":
                    if (xValue === null) return "null";
                    var bArray = true;
                    var asObjectValues = [], asArrayValues = [], iCounter = 0, iLength = null;
                    for (var i in xValue) {
                        if (bArray) switch (i) {
                            case "length": break;
                            case iCounter.toString(): iCounter++; asArrayValues.push(jUtils.serialize(xValue[i])); break;
                            default: bArray = false;
                        }
                        asObjectValues.push(jUtils.serialize(i) + ":" + jUtils.serialize(xValue[i]));
                    }
                    if (bArray) {
                        try {
                            bArray &= (xValue.length == iCounter);
                        } catch (e) {
                            bArray = false;
                        }
                    }
                    return (bArray ?
                        "[" + asArrayValues.join(",") + "]":
                        "{" + asObjectValues.join(",") + "}"
                    );
                default:
                    throw new Error("Objects of type " + typeof(xValue) + " cannot be serialized.");
            }
        }
    };


    window['jUtils'] = jUtils;
    window['jClass'] = jClass;

})();