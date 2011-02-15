/**
 * Created by iacob.campia@gmail.com.
 * Date: 2/14/11
 * Time: 10:08 AM
 */

$(document).ready(function(){
    module("Core");

    test("Interfaces", function() {

        raises(function() {
            jClass.interface({ willFail : function(a) { a = 1; } });
        }, "Cannot define bodies for interface methods");

        raises(function() {
            jClass.interface({ willFail : 1 });
        }, "Cannot define values for interface properties (Numbers)");

        raises(function() {
            jClass.interface({ willFail : "test" });
        }, "Cannot define values for interface properties (Strings)");

        raises(function() {
            jClass.interface({ willFail : true });
        }, "Cannot define values for interface properties (Booleans)");

        raises(function() {
            jClass.interface({ willFail : [1,2] });
        }, "Cannot define values for interface properties (Arrays and Objects)");

        var myInterface = jClass.interface({
            test : function(a,b,c) {},
            noArgs : function() {},
            b : Number,
            id : String,
            e : Boolean
        });

        raises(function() { myInterface() }, "Cannot instantiate interfaces");

        ok(myInterface.__type == "jInterface", "myInterface.__type == 'jInterface'");
        
    });
});