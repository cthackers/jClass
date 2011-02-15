/**
 * Created by iacob.campia@gmail.com.
 * Date: 2/14/11
 * Time: 1:43 PM
 */

$(document).ready(function(){
    module("Core");

    test("Classes - Creation and access", function() {

        var mainClass = jClass({
            constructor : function(arg) {
                initializedByConstructor = arg;
                this.parentFromConstructor += arg;
            },
            public : {
                parentPublicMethod : function() {
                    return "parentPublic"
                },
                getPrivateVars : function(name) {
                      return [initializedByConstructor, parentPrivateVar, parentPrivateMethod()]
                },
                parentPublicVar : "parent public var",
                parentFromConstructor : ""
            },
            private : {
                initializedByConstructor : 0,
                parentPrivateVar : "parent private var",
                parentPrivateMethod : function() {
                    return "parentPrivate " + initializedByConstructor + " " + this.parentPublicVar;
                }
            },
            static : {
                PARENT_STATIC : 1
            }
        });

        raises(function() { mainClass(); }, "Class instantiation");

        raises(function() { mainClass({asd:1}) }, "Casting wrong type of objects");

        var tmp = mainClass({parentPublicVar:1, parentFromConstructor:2});
        deepEqual(tmp.getPrivateVars(), [0, "parent private var", "parentPrivate 0 1"], "Object casting");

        var obj = new mainClass('test');
        ok(obj.parentFromConstructor == "test", "jClass constructor is called");
        ok(obj.parentPublicVar == "parent public var", "Access public variables from a jClass instance");
        ok(obj.parentPublicMethod() == "parentPublic", "Access public methods from a jClass instance");
        ok(obj.parentPrivateVar === undefined, "Cannot access private variables from a jClass instance");
        ok(obj.parentPrivateMethod === undefined, "Cannot access private methods from a jClass instance");

        ok(mainClass.PARENT_STATIC === 1, "Access static attributes from a jClass class");

        deepEqual(obj.getPrivateVars(), ['test', 'parent private var', 'parentPrivate test parent public var'], "Access private members from a public method in a jClass instance");

        obj.parentPublicVar = "true";
        deepEqual(obj.getPrivateVars(), ['test', 'parent private var', 'parentPrivate test true'], "Private methods can access public declarations");

    });

    test("Classes - Inheritence", function() {

        var someOtherClass = jClass({
            public : {
                id : 1
            }
        });

        raises(function() {
            var tmp = function() {};
            jClass.extend(tmp)({})
        }, "Cannot extend anything else beside jClass types");

        var mainClass = jClass({
            constructor : function(arg) {
                initializedByConstructor = arg;
                this.parentFromConstructor += arg;
            },
            public : {
                parentPublicMethod : function() {
                    return "parentPublic"
                },
                getPrivateVars : function(name) {
                      return [initializedByConstructor, parentPrivateVar, parentPrivateMethod()]
                },
                parentPublicVar : "parent public var",
                parentFromConstructor : ""
            },
            private : {
                initializedByConstructor : 0,
                parentPrivateVar : "parent private var",
                parentPrivateMethod : function() {
                    return "parentPrivate " + initializedByConstructor + " " + this.parentPublicVar;
                }
            },
            static : {
                PARENT_STATIC : 1
            }
        });
        
        var childClass = jClass.extend(mainClass)({
            constructor : function(args) {
                initializedByConstructor = args;
                this.childPublicVar = args;
            },
            public : {
                childPublicMethod : function() {
                    return "childPublic"
                },
                childPublicVar : "child public var"
            },
            private : {
                initializedByConstructor : 0,
                childPrivateVar : "child private var",
                childPrivateMethod : function() {
                    return "childPrivate"
                }
            },
            static : {
                CHILD_STATIC : 1
            }
        });

        var child = new childClass("from constructor");
        ok(child.childPublicVar == "from constructor", "Access public variables from a jClass instance");

        ok(childClass.PARENT_STATIC === 1, "Inherit static members from parent");
        ok(child.parentFromConstructor == "from constructor", "Parent constructor is called when initializing");

        ok(child.parentPublicVar == "parent public var", "Access public variables from a jClass parent");
        ok(child.parentPublicMethod() == "parentPublic", "Access public methods from a jClass parent");
        ok(child.parentPrivateVar === undefined, "Cannot access private variables from a jClass parent");
        ok(child.parentPrivateMethod === undefined, "Cannot access private methods from a jClass parent");

        deepEqual(child.getPrivateVars(), ["from constructor", "parent private var", "parentPrivate from constructor parent public var"], "Access private members from a public inherited method in a jClass instance");

        child.parentPublicVar = "true";
        deepEqual(child.getPrivateVars(), ["from constructor", "parent private var", "parentPrivate from constructor true"], "Private methods can access public declarations");

        ok(child.instanceOf(childClass) && child.instanceOf(mainClass) && !child.instanceOf(someOtherClass), "Validate deep inheritance");

        var tclass = jClass.extend(childClass)({public:{id:1}});
        var x = new tclass();

        ok(x.instanceOf(tclass) && x.instanceOf(childClass) && x.instanceOf(mainClass) && !x.instanceOf(someOtherClass), "Validate deep inheritance when base class extends itself")
    });
});