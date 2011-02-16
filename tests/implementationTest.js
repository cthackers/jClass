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

        var xInterface = jClass.interface({
            x : Boolean
        });

        var yInterface = jClass.interface({
            x : Boolean
        });

        var tmp = jClass.interface({
            m : Boolean
        });

        var baseClass = jClass.implement(tmp)({
            public : {
                test : function(a,b,c) {
                    return true;
                },
                e : true,
                m : true
            }
        });

        try { jClass.implement()({}); }
        catch(ex) { ok(ex.message == "No interface provided", "Interface argument must be provided"); }

        try { jClass.implement(baseClass)({}); }
        catch(ex) { ok(ex.message == "Cannot implement other types beside jInterface interfaces",
                "Implementing anything else beside jInterface will fail"); }

        try { jClass.implement(myInterface)({}); }
        catch(ex) { ok(ex.message == "Class member `test` of type `function` required by interface was not found in class implementation",
                "Throw error if class members are not implemented"); }

        try { jClass.implement(myInterface)({public:{test:1}}) }
        catch(ex) { ok(ex.message == "Type of `test` (number) is not the same type required by the interface : function", "Throw type mismatch error"); }

        try { jClass.implement(myInterface)({public:{test:function(a){}}}) }
        catch(ex) { ok(ex.message == "Arguments of method `test` do not meet interface requirements", "Argument missmatch error"); }

        var okClass = jClass.extend(baseClass).implement(myInterface, xInterface)({
            public : {
                noArgs : function() {},
                b : 0,
                id : "id",
                x : false
            }
        });

        var m = new okClass();
        ok(m.implementationOf(myInterface) && m.implementationOf(xInterface) && m.implementationOf(tmp) && !m.implementationOf(yInterface), "implementationOf goes up the entire tree")


        var k = jClass.implement(xInterface).extend(baseClass)({
            public:{
                x:true
            }
        });
        ok(new k().x, "Both jClass.extend().implements() and jClass.implements().extends() work")
    })

});