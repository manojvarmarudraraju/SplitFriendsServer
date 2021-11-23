var groupRoute = require('express').Router();
var { logger } = require('../utils');
var { verifyJWT } = require('../utils/jwt');
var { groupData, listGroups, calculateDebts, addExpense  } = require('../db/groups/utils')


groupRoute.use((req,res,next) => {
    console.log("came here");
    try{
        verifyJWT(req,res);
        next();
    } catch(err){
        res.status(403).json({error: err});
    }
});

groupRoute.get("/data", async (req, res) => {   
    var id = req.body.user.user["_id"];
    console.log(id);
    try{
        var result = await listGroups(id);
        return res.status(200).json({data: result});
    }
    catch(err){
        return res.status(500).json({error: err});
    }

});

groupRoute.get("/:groupId", async (req, res) => {
    var { groupId } = req.params;
    var id = req.body.user.user["_id"];
    try{
        var result = await groupData(groupId);
        console.log("group data");
        var debts = await calculateDebts(groupId, id);
        console.log("calculateDebts");
        return res.status(200).json({ data: result, debts});
    } catch(err){
        return res.status(500).json({error: err});
    }
});

groupRoute.put("/new", async(req, res) => {
    var { body } = req.body;
    var id = req.body.user.user["_id"];
    try{
        var result = await addGroup(data, id);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({error: err});
    }
})

groupRoute.put("/expense/:groupId/", async (req, res) => {
    var { groupId } = req.params;
    var id = req.body.user.user["_id"];
    var { expense } = req.body;
    try{
        var result = await addExpense(groupId, expense);
        var debts = await calculateDebts(groupId, id);
        return res.status(200).json({ data: result, debts});
    } catch(err){
        return res.status(500).json({error: err});
    }
});

groupRoute.delete("/:groupId", async function(req, res){
    var { groupId } = req.params;
    try{
        await deleteGroup(groupId);
        return res.status(200).json({success: true});
    } catch(err){
        return res.status(500).json({error: err});
    }
});

groupRoute.delete("/:groupId/expense/:expenseId", async function(req, res){
    var { groupId, expenseId } = req.params;
    try{
        await deleteExpense(groupId, expenseId);
        return res.status(200).json({success: true});
    } catch(err){
        return res.status(500).json({error: err});
    }
});

groupRoute.post("/:groupId/expense/:expenseId", async function(req, res){
    var { groupId } = req.params;
    var { expense } = req.body;
    try{
        await deleteExpense(groupId, expense);
        return res.status(200).json({success: true});
    } catch(err){
        return res.status(500).json({error: err});
    }
});

groupRoute.post("/:groupId/settle", async (req, res) => {
    var { groupId } = req.params;
    var { lender, borrower, money, everything} = req.body;
    try{
        var results = await settleDebts(groupId, lender, borrower, money, everything);
        return res.status(200).json(results);
    } catch(err){
        return res.status(500).json({error: err});
    }
});



module.exports = groupRoute;

