/**
 * Created by iacob.campia@gmail.com.
 * Date: 2/14/11
 * Time: 10:08 AM
 */

$(document).ready(function(){
    module("Core");

    test("Interfaces", function() {

        try {
            jClass.interface({ willFail : function(a) { a = 1; } });
        } catch (ex) {
            equal(ex.message, "Interface must not implement a method body (on method: willFail)",
                    "Cannot define bodies for interface methods");
        }

        try {
            jClass.interface({ willFail : 1 });
        } catch (ex) {
            equal(ex.message, "Interface property `willFail` can't have a value. Define it using a type instead of a value (eg willFail : Number)",
                    "Cannot define values for interface properties (Numbers)");
        }

        try {
            jClass.interface({ willFail : "test" });
        } catch (ex) {
            equal(ex.message, "Interface property `willFail` can't have a value. Define it using a type instead of a value (eg willFail : String)",
                    "Cannot define values for interface properties (Strings)");
        }

        try {
            jClass.interface({ willFail : true });
        } catch (ex) {
            equal(ex.message, "Interface property `willFail` can't have a value. Define it using a type instead of a value (eg willFail : Boolean)",
                    "Cannot define values for interface properties (Booleans)");
        }

        try {
            jClass.interface({ willFail : [1,2] });
        } catch (ex) {
            equal(ex.message, "Interface property `willFail` can't have a value. Define it using a type instead of a value (eg willFail : Object)",
                    "Cannot define values for interface properties (Arrays and Objects)");
        }

        var myInterface = jClass.interface({
            test : function(a,b,c) {},
            noArgs : function() {},
            b : Number,
            id : String,
            e : Boolean
        });

        try {
            myInterface()
        } catch (ex) {
            equal(ex.message, "An interface cannot be instantiated!", "Cannot instantiate interfaces")
        }

        equal(myInterface.type, "jInterface", "myInterface.type == 'jInterface'");
        
    });
});