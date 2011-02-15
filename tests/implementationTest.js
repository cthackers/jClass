/**
 * Created by iacob.campia@gmail.com.
 * Date: 2/15/11
 * Time: 3:35 PM
 */

$(document).ready(function(){
    module("Core");

    test("Classes - Interface implementation", function() {

        var myInterface = jClass.interface({
            test : function(a,b,c) {},
            noArgs : function() {},
            b : Number,
            id : String,
            e : Boolean
        });

        var baseClass = jClass({
            public : {
                test : function(a,b,c) {
                    return true;
                }
            }
        });

         raises(function(){
             jClass.implement()({});
         }, "Interface argument must be provided");

        raises(function() {
            jClass.implement(baseClass)({});
        }, "Implementing anything else beside jInterface will fail");

        raises(function() {
            jClass.implement(myInterface)({});
        }, "Throw error if class members are not implemented");

        raises(function() {
            jClass.implement(myInterface)({public:{test:1}})
        }, "Throw type mismatch error");

        raises(function() {
            jClass.implement(myInterface)({public:{test:function(a){}}})
        }, "Argument missmatch error");
    })

});