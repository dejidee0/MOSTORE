const QuantityBadge =({quantity,variant='default'})=>{

    const variantClasses={
         default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    };


    return (

        <span className={`${variantClasses[variant]} text-xs px-2 py-1 rounded-full font-medium`}>
            {quantity} in cart
        </span>
    )
}

export {QuantityBadge}