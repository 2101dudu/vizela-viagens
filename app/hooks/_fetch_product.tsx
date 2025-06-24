import { ApiData } from "../product/[code]/_booking_form";

export interface TextContent {
    Type: string;
    Content: string;
}

export interface PhotoContent {
    ImageUrl: string;
}

export interface ResponseData {
    data: ApiData;
    textArray: TextContent[];
    photoArray: PhotoContent[];
}



export default async function FetchProduct(code: string) {
    const res = await fetch(`http://localhost:8080/api/get/product/${code}`);
    if (!res.ok) throw new Error("Failed to fetch product");

    const product = await res.json();
    
    console.log("Fetched product:", product);

    if (!product || !product.data) {
        throw new Error("Product not found");
    }

    return {
        data: product.data,
        textArray: product.descriptionArray.item || [],
        photoArray: product.photoArray.item || []
    } as ResponseData;
}