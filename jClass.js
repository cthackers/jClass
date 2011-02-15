/**
 * Created by iacob.campia@gmail.com.
 * Date: 2/14/11
 * Time: 9:55 AM
 */
(function() {

    var cache = {
        hashes : { classes : {}, interfaces : {} },
        cachedLibraries : Array(0),
        classCount : 0,
        interfCount : 0
    };

    var jClass = function(obj) {
        if (typeof obj !== "undefined") {
            var tmp = jUtils.parseObject(obj);

            cache.hashes.classes[tmp['id']] = {
                extends:jUtils.resolveInheritanceTree(obj),
                implements:jUtils.resolveImplementationTree(obj),
                reference:tmp
            };

            tmp.method.__hash = tmp['id'];
            tmp.method.__type = "jClass";

            tmp.method.prototype.instanceOf = function(cls) {
               return jUtils.instanceOf.apply(tmp.method, [cls]);
            };

            return tmp.method;
        }
        return null;
    };

    jClass.config = {
        librariesPath : '/libraries/'
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
                var tmp = jUtils.getMethodInfo(cls[method], true);
                type = tmp[0];
                if (tmp.length == 2) {
                    args = tmp[1];
                }
            } else {
                throw new Error("Interface property `" + method + "` can't have a value. Define it using a type instead of a value (eg " + method + " : " + type[0].toUpperCase() + type.substr(1) + ")")
            }
            interface[method] = args.length ? [type, args] : [type];
        }
        var interfaceHash = '#' + ++cache.interfCount;
        cache.hashes.interfaces[interfaceHash] = interface;

        var result = function() { throw new Error("An interface cannot be instantiated!"); };
        result.__hash = interfaceHash;
        result.__type = "jInterface";

        return result
    };
    
    jClass.extend = function(cls) {
        if (cls && cls.__type == "jClass") {
            return function(obj) {
                obj['__inheritance'] = cls.__hash;
                return jClass(obj);
            };
        } else {
            throw new Error("Cannot extend other types beside jClass classes")
        }
    };

    jClass.implement = function() {
        if (arguments.length === 0) {
            throw new Error("No interface provided");
        }
        var interfaces = new Array(0);
        for (var i = 0; i < arguments.length; i++) {
            var interface = arguments[i];
            if (!interface || interface.__type != 'jInterface') {
                throw new Error("Cannot implement other types beside jInterface interfaces")
            }
            interfaces.push(interface.__hash);
        }
        return function(obj) {
            console.log(cache);
            obj['__implements'] = interfaces;
            return jClass(obj);
        };
    };

    jClass.require = function() {
        if (!document.getElementById) return false;
        var libs = cache.cachedLibraries, path = "",
            libPath = jClass.config.librariesPath,
            file = "",
            head = document.getElementsByTagName("head")[0] || document.documentElement;

        if (!jClass.config.librariesPath.match(/\/$/))
            libPath = jClass.config.librariesPath = (libPath += '/');

        for (var idx = arguments.length - 1; idx > -1; idx--) {
            file = arguments[idx];
            if (!~libs.indexOf(file) && file) {
                if (file.match(/\.js$/)) {
                    path = file;
                } else {
                    if (file.match(/^.[a-zA-Z\.]*$/)) {
                        path = libPath + file.replace(/\./g, "/") + ".js";
                    }
                }
                var fileRef = window.document.createElement("script");
                fileRef.setAttribute("type", "text/javascript");

                if (typeof fileRef === "undefined") {
                    return false;
                } else {
                    var oXML = jUtils.getXMLHttpObj();
                    if (oXML) {
                        oXML.open('GET', path, false);
                        oXML.send('');
                        if (oXML.status == 404) {
                            throw new Error("Library " + path + " not found");
                        } else {
                            if (window.ActiveXObject) {
                                eval(oXML.responseText);
                            } else {
                                head.insertBefore(fileRef, head.firstChild);
                                jUtils.appendChild(fileRef, oXML.responseText);
                            }
                            libs.push(file);
                        }
                    } else {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    var jUtils = {

        getMethodInfo : function(method, emptyBodies) {
            var type = typeof(method);
            var args = Array(0);
            if (type == "function") {
                if (method == Number) {
                    type = "number";
                } else if (method == String) {
                    type = "string";
                } else if (method == String) {
                    type = "string";
                } else if (method == Boolean) {
                    type = "boolean";
                } else if (method == Array) {
                    type = "array";
                } else {
                    var body = jUtils.getBody(method);
                    var reg = emptyBodies ? /function[ ]{0,}\([a-zA-Z0-9$, ]{0,}\)[ ]{0,}\{[ ]{0,}\}/i : /function[ ]{0,}\([a-zA-Z0-9$, ]{0,}\)[ ]{0,}\{/i;
                    if (body.match(reg)) {
                        var tmp = body.replace(/function\s*|\s*{[\s\S]*/g, "").match(/(\w*\s*)\(([^\)]*)\)/)[2];
                        if (tmp) {
                            args = tmp.split(", ");
                        }
                    } else {
                        if (emptyBodies)
                            throw new Error("Interface must not implement a method body (on method: " + method + ")")
                    }
                }
            }
            return args.length ? [type, args] : [type];
        },

        resolveInheritanceTree : function(obj) {
            if (obj.__inheritance) {
                var tmp = obj.__inheritance;
                delete(obj.__inheritance);
                return [tmp].concat(cache.hashes.classes[tmp].extends);
            }
            return [];
        },

        resolveImplementationTree : function(obj) {
            if (obj.__implementation) {
                var tmp = obj.__implementation;
                delete(obj.__implementation);
                return [tmp].concat(cache.hashes.classes[tmp].implements);
            }
            return [];
        },

        castObject : function(object, classId) {
            var instance = new cache.hashes.classes[classId].reference.method([String.fromCharCode(0xF0A4ADA2)]);
            var props = jUtils.getObjectProperties(object, false);
            if (props.length === 0) {
                throw new Error("Cannot instantiate the object these way. Use `new Class()` to instantiate or `Class(object)` to cast object to Class")
            }
            var objectProps = jUtils.getObjectProperties(instance, false);
            if (jUtils.serialize(props) == jUtils.serialize(objectProps)) {
                for (var idx in props) {
                    instance[props[idx]] = object[props[idx]];
                }
            } else {
                throw new Error("Cast error! Object cannot be cast to this type of class")
            }
            return instance;
        },

        getObjectProperties : function(object, getFunctions) {
            var result = Array(0);
            for (var name in object) {
                if (typeof object[name] == "function") {
                    getFunctions && result.push(name);
                } else {
                    result.push(name);
                }
            }
            return result;
        },

        blankClass : function() {},
        
        parseObject : function(body, returnString) {
            var publics = body.public || {},
                privates = body.private || {},
                statics = body.static || {},
                constructor = (body.constructor == Object().constructor) ? false : body.constructor,

                method = "function() {\nvar __self = this;\n",
                result = {publics:{}, statics:[], method:undefined, id:'#' + ++cache.classCount};

            if (body['__inheritance']) {
                var parentCls = cache.hashes.classes[body['__inheritance']];
                var reference = parentCls.reference;
                method += "\nvar super = (" + jUtils.getBody(reference.method) + ").apply(this, arguments)\n";
                for (var s in reference.statics) {
                    var name = reference.statics[s];
                    statics[name] === undefined && (statics[name] = reference.method[name])
                }
                for (var i in reference.publics) {
                    result.publics[i] = reference.publics[i]
                }
            }

            if (constructor)
                method += "\nvar __constructor = " + jUtils.serialize(constructor, true) + ";\n";

            for (var pubMethod in publics) {
                if (typeof publics[pubMethod] == "function") {
                    method += "\nthis." + pubMethod + " = " + jUtils.serialize(publics[pubMethod], true) +  ";\n";
                } else {
                    method += "\nthis." + pubMethod + " = " + jUtils.serialize(publics[pubMethod], true) + ";\n";
                }
                result.publics[pubMethod] = jUtils.getMethodInfo(publics[pubMethod]);
            }

            if (body['__implements']) {
                var required = cache.hashes.interfaces[body['__implements']];
                for (var mName in required) {
                    var P = result.publics;
                    if (P[mName]) {
                        if (P[mName][0] == required[mName][0]) {
                            if (required[mName][1] && jUtils.serialize(P[mName][1]) != jUtils.serialize(required[mName][1])) {
                                throw new Error("Arguments of method `" + mName + "` do not meet interface requirements");
                            }
                        } else {
                            throw new Error("Type of `" + mName + "` (" + P[mName][0] + ") is not the same type required by the interface : " + required[mName][0]);
                        }
                    } else {
                        throw new Error("Class member `" + mName + "` of type `" +  required[mName][0] + "` required by interface was not found in class implementation");
                    }
                }
            }

            for (var privMethod in privates) {
                method += "\nvar " + privMethod + " = " + jUtils.serialize(privates[privMethod], true).replace(/this\./g, "__self.") + "\n";
            }
            method += "if (this.constructor == window.Window) { if(jUtils.getObjectProperties(arguments[0])) return jUtils.castObject(arguments[0], '" + result.id + "'); };\n";
            method += (constructor ? "\n(arguments.length == 1 && typeof arguments[0].concat == 'function' " +
                    "&& arguments[0][0] == String.fromCharCode(0xF0A4ADA2)) || __constructor.apply(this, arguments)" : "") + "}";

            var tmp = function() {};
            try {
                eval("tmp = " + method);
            } catch(ex) {}

            for (var sMethod in statics) {
                tmp[sMethod] = statics[sMethod];
                result.statics.push(sMethod);
            }

            result.method = tmp;

            if (returnString)
                return method;

            return result;
        },

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
        instanceOf : function(cls) {
            if (cls && cls.__type == "jClass" && cls.__hash !== '') {
                if (cls.__hash == this.__hash) {
                     return true;
                }
                if (cache.hashes.classes[this.__hash].extends.indexOf(cls.__hash) != -1) {
                     return true;
                }

            }
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
        serialize : function(xValue, noEncode) {
            switch (typeof(xValue)) {
                case "undefined": return "void(0)";
                case "boolean":   return xValue.toString();
                case "number":    return xValue.toString();
                case "string":    return "\"" + (noEncode ? xValue : jUtils.stringEncode(xValue)) + "\"";
                case "function":  return (noEncode ? xValue.toString() : "eval(\"" + jUtils.stringEncode(xValue.toString())+ "\")") ;
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
        },

        getXMLHttpObj : function() {
            if(typeof(XMLHttpRequest) != 'undefined') {
                return new XMLHttpRequest();
            }
            var axO = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.4.0', 'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'], i;
            for (i = 0; i < axO.length; i++) {
                try {
                    return new ActiveXObject(axO[i]);
                } catch(e) {}
            }
            return null;
        },

        appendChild : function(node, text) {
            if (null === node.canHaveChildren || node.canHaveChildren) {
                node.appendChild(document.createTextNode(text));
            } else {
                node.text = text;
            }
        },

        loopUnroll : function(values, method) {
            var iterations = Math.floor(values.length / 8), leftover = (values.length % 8), i = 0;
            if (leftover > 0) {
                do {
                    method(values[i++]);
                } while (--leftover > 0);
            }
            if (iterations > 0)
            do {
                method(values[i++]); method(values[i++]); method(values[i++]); method(values[i++]);
                method(values[i++]); method(values[i++]); method(values[i++]); method(values[i++]);
            } while (--iterations > 0);
        }
    };


    //window['jUtils'] = jUtils;
    window['jClass'] = jClass;

})();