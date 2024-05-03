// prototyping question ( functional superpowers :) )

console.log(typeof(Date))

Date.prototype.daysTo  = function(secondDate) {
    return (secondDate.getTime() - this.getTime())/(1000*60*60*24);
}
const timeDeferenceInDays = (new Date('2024-05-01')).daysTo(new Date('2024-05-02'));
console.log(timeDeferenceInDays)


/* -------------------------------------------------------------------------*/
// second question
const salesArray = [
    { amount: 10000, quantity: 10 },
    { amount: 5000, quantity: 5 },
    { amount: 20000, quantity: 8 }
];


const OrderedArrayOfSales = () => {
    return salesArray.map((sales) =>{
        return {...sales, Total: sales.amount*sales.quantity}
    })
}

console.log('Original Ordered Array Of Sales')
console.log(OrderedArrayOfSales())

const sortSalesOrdersByTotal = () => {

    return [...OrderedArrayOfSales()].sort((a, b) => {return a.Total - b.Total});
}


console.log('Ordered Array Of Sales By Total')
console.log(sortSalesOrdersByTotal())



/* -------------------------------------------------------------------------*/
// third question - recursive calls ;)

const src = {
    prop11:{
        prop21: 21,
        prop22: {
            prop31: 31,
            prop32: 32,
        }
    },
    prop12: 12
}

const proto = {
    prop11: {
        prop22: {
            prop32: null
        }
    },
    prop12: null,
    prop: null
}
 
const result = (__proto, __src) => {
    // we need to this in the levels of object
    const keysOfProto = Object.keys(__proto)
    const keysOfSrc = Object.keys(__src)

  
    keysOfProto.forEach(key => {
        let index = keysOfSrc.indexOf(key) ;
        if(index !== -1 && __proto[key]){
            __proto[key] = result(__proto[key], __src[keysOfSrc[keysOfSrc.indexOf(key)]]);
        }else if (index !== -1 && !__proto[key]){
            __proto[key] = __src[keysOfSrc[keysOfSrc.indexOf(key)]]
        }else{
            // element not found in src
            __proto[key] = null;
        }
    })

    return __proto; 
}

console.log(result(proto, src))

