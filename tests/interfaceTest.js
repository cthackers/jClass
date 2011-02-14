/**
 * Created by iacob.campia@gmail.com.
 * Date: 2/14/11
 * Time: 10:08 AM
 */

$(document).ready(function(){
    module("Core");

    test("Interfaces", function() {

        try {
            var fail = jClass.interface({ willFail : function(a) { a = 1; } });
        } catch (ex) {
            equal(ex.message, "Interface must not implement a method body (on method: willFail)",
                    "Cannot define bodies for interface methods");
        }

        try {
            var fail = jClass.interface({ willFail : 1 });
        } catch (ex) {
            equal(ex.message, "Interface property `willFail` can't have a value. Define it using types (eg willFail : Number)",
                    "Cannot define values for interface attributes (Numbers)");
        }

        try {
            var fail = jClass.interface({ willFail : "test" });
        } catch (ex) {
            equal(ex.message, "Interface property `willFail` can't have a value. Define it using types (eg willFail : String)",
                    "Cannot define values for interface attributes (Strings)");
        }

        try {
            var fail = jClass.interface({ willFail : true });
        } catch (ex) {
            equal(ex.message, "Interface property `willFail` can't have a value. Define it using types (eg willFail : Boolean)",
                    "Cannot define values for interface attributes (Booleans)");
        }

        try {
            var fail = jClass.interface({ willFail : [1,2] });
        } catch (ex) {
            equal(ex.message, "Interface property `willFail` can't have a value. Define it using types (eg willFail : Object)",
                    "Cannot define values for interface attributes (Arrays and Objects)");
        }

        var interface = jClass.interface({
            test : function(a,b,c) {},
            noArgs : function() {},
            b : Number,
            id : String,
            e : Boolean
        });

        try {
            interface()
        } catch (ex) {
            equal(ex.message, "An interface cannot be instantiated!", "Cannot instantiate interfaces")
        }
        
        console.log("interface", typeof interface);
        console.dir(interface);

        var tmp = jClass({
            constructor : function(init) {
                console.log("inside constructr", init);
            },
            public : {
                test : function(argument) {
                    console.log("test method", argument)
                },
                val : 2
            },
            private : {
                testPrivate : function(argument) {
                    console.log("test private", argument)
                },
                value : 3
            },
            static : {
                STAT : function(argument) {
                    console.log("static", argument)
                },
                STAT_VAL : 4
            }
        });

        console.log("class");
        console.dir(tmp);

        var x = new tmp();

        console.log("instance");
        console.dir(x);
        
    });
});