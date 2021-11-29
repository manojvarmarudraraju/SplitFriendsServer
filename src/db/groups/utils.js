const groupModel = require('../schema/groups');
const mongoose = require('../MongoConnection');
const {addGroupUser, userGroups} = require('../user');

async function groupData(group){
    try{
        var results = await groupModel.findById(group);
        return results;
    } catch(err){
        throw err;
    }
}

async function calculateDebts(groupID,userID){
    try{
        const group = await groupData(groupID);
        var {expenses} = group;

        var users = {};

        for(var expense in expenses){
            for(var exp in expense){
                var { lender, borrower, is_settled, amount, is_deleted} = exp;
                if(!is_deleted && !is_settled && lender === userID && borrower !== userID){
                    if(!(borrower in users)){
                        users[borrower] = 0;
                    }
                    users[borrower] += amount;
                }
                if(!is_deleted && !is_settled && lender !== userID && borrower === userID){
                    if(!(lender in users)){
                        users[lender] = 0;
                    }
                    users[lender] -= amount;
                }
            }
        }

        return users;
    } catch(e) {
        throw e;
    }
}

async function settleDebts(group, lend, borrow, money, everything = false) {
    try{
        const group_vals = await groupData(group);
        var {expenses} = group_vals;
        expenses.sort((a, b) => a.timestamp - b.timestamp);
        if(!everything){    
            for(var expense in expenses){
                for(var exp in expense){
                    var { lender, borrower, is_settled, amount, is_deleted} = exp;
                    if(!is_deleted && !is_settled && lend === lender && borrower === borrow){
                        if(amount <= money){
                            exp.amount = 0;
                            exp.is_settled = true;
                            money -= amount;
                        } else{
                            exp.amount -= money;
                            money = 0;
                        }
                        if(money === 0){
                            break;
                        }
                    }
                }
                if(money === 0){
                    break;
                }
            }
        } else{
            for(var expense in expenses){
                for(var exp in expense){
                    var { lender, borrower, is_settled, amount, is_deleted} = exp;
                    if(!is_deleted && !is_settled && lend === lender && borrower === borrow){
                        exp.amount = 0;
                        exp.is_settled = true;
                    }
                }
            }
        }
        var results = await groupModel.findByIdAndUpdate(group, {expenses});
        return results;

    } catch(err) {
        throw err;
    }
}


async function addExpense(group, expense){
    try{
        const group_vals = await groupData(group);

        expense["_id"] = new mongoose.Types.ObjectId();
        for(item in expense){
            item["ori_amount"] = item["amount"];
        }
        var { expenses } = group_vals;
        
        var new_expenses = [expense, ...expenses ];

        var results = groupModel.getByIdAndUpdate(group, {expenses: new_expenses});

        return results;
    } catch(err) {
        throw err;
    }
}

async function addGroup(data, id){
    console.log("tetetete:",id);
    var {name, members} = data;
    console.log(name,members);
    try{
        var result = await groupModel.create({name, admin: id, members, expenses: []});
        console.log(result);
        await addGroupUser(result["_id"], [id, ...members]);
        var result = await listGroups(id);
        return result;
    } catch(err){
        console.log(err);
        throw err;
    }
}

async function listGroups(user){
    var result = {};
    try{
        var groups = await userGroups(user);
        for(var i=0; i<groups.length; i++){
            var group = groups[i];
            if(!(group in result)){
                result[group] = {};
            }
            console.log("group:",group);
            var group_det = await groupModel.findById(group, {  name: 1, admin: 1});
            console.log(group_det);
            var debts = await calculateDebts(group, user);
            console.log(debts);
            var {name, admin} = group_det;
            result[group] = {"_id": group, name, admin, debts};
        }
        console.log(result);
        var final = [];
        for(var item in result){
            console.log(result[item]);
            final.push(result[item]);
        }
        return final;
    } catch(err){
        throw err;
    }
}

async function deleteGroup(group){
    try{
        await groupModel.findByIdAndUpdate(group, {is_archived: true});
        return;
    } catch(err){
        throw err;
    }
}

async function deleteExpense(group, expense_id){
    try{
        const { expenses } = await groupData(group);
        for(expense in expenses){
            if(expense["_id"] == expense_id){
                expense["is_deleted"] = true;
            }
        }
        await groupModel.getByIdAndUpdate(group, { expenses });
        return;
    } catch(err){
        throw err;
    }
}

async function updateExpense(group, expense){
    try{
        const { expenses } = await groupData(group);
        for(var i=0; i< expenses.length; i++){
            if(expenses[i]["_id"] == expense["_id"]){
                expenses[i] = expense;
            }
        }
        await groupModel.getByIdAndUpdate(group, { expenses });
        return;
    } catch(err){
        throw err;
    }
}


module.exports = { groupData, calculateDebts, settleDebts, addExpense, listGroups, deleteGroup, addGroup, deleteExpense, updateExpense };