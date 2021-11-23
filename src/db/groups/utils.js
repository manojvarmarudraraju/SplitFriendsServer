const groupModel = require('../schema/groups');
const mongoose = require('../MongoConnection');
const {addGroupUser} = require('../user');

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
        var { expenses } = group_vals;
        
        var new_expenses = [expense, ...expenses, ];

        var results = groupModel.getByIdAndUpdate(group, {expenses: new_expenses});

        return results;
    } catch(err) {
        throw err;
    }
}

async function addGroup(data){
    var {name, admin, members} = data;
    try{
        var result = await groupModel.create({name, admin, members, expenses: []});
        await addGroupUser(result["_id"], [admin, ...members]);
        return result;
    } catch(err){
        throw err;
    }
}

async function listGroups(groups, user){
    var result = {};
    try{
        for(group in groups){
            if(!(group in result)){
                result[group] = {};
            }

            var group_det = await groupModel.findById(group, {  name: 1, admin: 1});
            var debts = await calculateDebts(group, user);
            result[group] = {...group_det,debts};
        }
        var final = [];
        for(item in result){
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