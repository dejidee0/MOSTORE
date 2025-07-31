import { getProductById } from "@/lib/data/products";


// export async function GET(_,{params}){

//     try {
//         const {id }  =await params


//         const product =await getProductById(id)
        
//         if(!product){
// return Response.json(
//     {error:"product not found"},
//     {status:404}
// )

//         }

//         return Response.json(product)
//     } catch (error) {
//         console.error("Error fetching product:",   error);
//         return Response.json(
//             {error:"Internal Server error"},
//             {status:500}
//         )
        
//     }
// }


export async function GET(_, { params }) {
    try {
        const { id } = await params;

        const product = await getProductById(id);
        
        if (!product) {
            return Response.json(
                { error: "product not found" },
                { status: 404 }
            );
        }

        // Fetch related products if they exist
        let relatedProducts = [];
        if (product.related_products && product.related_products.length > 0) {
            try {
                // Fetch all related products concurrently
                const relatedProductsPromises = product.related_products.map(relatedId => 
                    getProductById(relatedId)
                );
                
                const relatedProductsData = await Promise.all(relatedProductsPromises);
                
                // Filter out any null results (in case some related products don't exist)
                relatedProducts = relatedProductsData.filter(relatedProduct => relatedProduct !== null);
            } catch (relatedError) {
                console.error("Error fetching related products:", relatedError);
                // Continue with empty related products array if there's an error
                relatedProducts = [];
            }
        }

        // Return product with related products included
        return Response.json({
            ...product,
            relatedProductsData: relatedProducts
        });

    } catch (error) {
        console.error("Error fetching product:", error);
        return Response.json(
            { error: "Internal Server error" },
            { status: 500 }
        );
    }
}