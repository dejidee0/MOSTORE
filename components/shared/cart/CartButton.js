export const AddToCartButton = ({
  product,
  selectedColor = null,
  selectedSize = null,
  quantity = 1,
  disabled = false,
  className = "",
}) => {
  const { addItem, isItemInCart, getItemCount } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "/placeholder-image.jpg",
      selectedColor,
      selectedSize,
      quantity: 1,
    };

    addItem(cartItem, quantity);
    addToast(`${product.name} added to cart!`, "success");
  };

  const itemInCart = isItemInCart(product.id, selectedColor, selectedSize);
  const itemCount = getItemCount(product.id, selectedColor, selectedSize);

  const defaultClassName = `px-8 py-3 rounded font-semibold transition-colors ${
    disabled
      ? "bg-gray-400 text-white cursor-not-allowed"
      : "bg-orange-500 text-white hover:bg-orange-600"
  }`;

  return (
    <button
      className={className || defaultClassName}
      onClick={handleAddToCart}
      disabled={disabled}
    >
      {itemInCart ? `In Cart (${itemCount})` : "Add to Cart"}
    </button>
  );
};
