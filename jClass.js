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
                inheritance: jUtils.resolveInheritanceTree(obj),
                reference:tmp
            };

            tmp.method.__hash = tmp['id'];
            tmp.method.__type = "jClass";

            tmp.method.prototype.instanceOf = function(cls) {
               return jUtils.instanceOf.apply(tmp.method, [cls]);
            };
            tmp.method.prototype.implementationOf = function(interf) {
                return jUtils.implementationOf.apply(tmp.method, [interf])
            };
            return tmp.method;
        }
        return null;
    };

    window['cache'] = cache

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
                var tmp = jUtils.getMethodInfo(cls[method], true, method);
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
            var tmp = function(obj) {
                obj['__inheritance'] = cls.__hash;
                return jClass(obj);
            };
            tmp.implement = function() {
                var interface = arguments;
                return function(obj) {
                    obj['__inheritance'] = cls.__hash;
                    return jClass.implement.apply(this, interface)(obj);
                }
            };
            return tmp;
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
        
        var tmp = function(obj) {
            obj['__implementation'] = interfaces;
            return jClass(obj);
        };
        tmp.extend = function() {
                var class = arguments;
                return function(obj) {
                    obj['__implementation'] = interfaces;
                    return jClass.extend.apply(this, class)(obj);
                }
            };
        return tmp;
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

        getMethodInfo : function(method, emptyBodies, methodName) {
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
                            throw new Error("Interface must not implement a method body (on method: " + (methodName || '') + ")")
                    }
                }
            }
            return args.length ? [type, args] : [type];
        },

        resolveInheritanceTree : function(obj) {
            var tree = {extends : Array(0), implements : Array(0)};
            if (obj.__inheritance) {
                var tmp = obj.__inheritance;
                delete(obj.__inheritance);
                tree.extends =  [tmp].concat(cache.hashes.classes[tmp].inheritance.extends);
            }
            if (obj.__implementation) {
                var x = obj.__implementation;
                delete(obj.__implementation);
                tree.implements = tree.implements.concat(x);
                for (var i = 0; i < tree.extends.length; i++) {
                    var a = cache.hashes.classes[tree.extends[i]].inheritance.implements;
                    for (var j = 0; j < a.length; j++) {
                        if (tree.implements.indexOf(a[j]) == -1)
                            tree.implements.push(a[j]);
                    }
                }
            }
            return tree;
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

            if (body['__implementation']) {
                for (var k = 0; k < body['__implementation'].length; k++) {
                    var required = cache.hashes.interfaces[body['__implementation'][k]];
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
            }

            for (var privMethod in privates) {
                method += "\nvar " + privMethod + " = " + jUtils.serialize(privates[privMethod], true).replace(/this\./g, "__self.") + "\n";
            }
            method += "if (this.constructor == window.Window) { if(jUtils.getObjectProperties(arguments[0])) return jUtils.castObject(arguments[0], '" + result.id + "'); };\n";
            method += (constructor ? "\n(arguments.length == 1 && typeof arguments[0].concat == 'function' " +
                    "&& arguments[0][0] == String.fromCharCode(0xF0A4ADA2) && (arguments = Array(0))) || __constructor.apply(this, arguments)" : "") + "}";

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
                if (cache.hashes.classes[this.__hash].inheritance.extends.indexOf(cls.__hash) != -1) {
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
        implementationOf : function(interface) {
            if (interface && interface.__type == "jInterface" && interface.__hash !== '') {
                if (cache.hashes.classes[this.__hash].inheritance.implements.indexOf(interface.__hash) != -1) {
                     return true;
                }
            }
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


    window['jUtils'] = jUtils;
    window['jClass'] = jClass;

})();