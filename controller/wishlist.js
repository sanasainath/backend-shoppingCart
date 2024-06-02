const Product =require('../model/product');
const Wishlist=require('../model/wishlist')

// Controller method to add a product to the wishlist
exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.userId;

    try {
        // Find the product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Check if the wishlist already exists for the user
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            // If the wishlist doesn't exist, create a new one
            wishlist = new Wishlist({ user: userId, wishItems: [{ product }] });
        } else {
            // If the wishlist exists, check if the product is already in the wishlist
            const productIndex = wishlist.wishItems.findIndex(item => item.product.equals(productId));

            if (productIndex === -1) {
                // If the product is not in the wishlist, add it
                wishlist.wishItems.push({ product });
            } else {
                return res.status(400).json({ msg: 'Product already exists in the wishlist' });
            }
        }

        await wishlist.save();
        return res.status(200).json({ msg: 'Product added to wishlist successfully', wishlist });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
};


// Controller method to remove a product from the wishlist
exports.removeFromWishlist = async (req, res) => {
    const  productId  = req.body.productId;
    const userId = req.user.userId;
         console.log("proddddd",productId)
    // Check if productId is provided
    if (!productId) {
        return res.status(400).json({ msg: 'Product ID is required' });
    }

    try {
        // Find the wishlist for the user
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({ msg: 'Wishlist not found' });
        }

        // Convert productId to string for accurate comparison
        const productIdStr = productId.toString();

        // Filter out the product to be removed from the wishlist
        const updatedWishItems = wishlist.wishItems.filter(item => {
            // Log the item and item.product for debugging
            console.log('Processing wishlist item:', item);
            
            // Ensure item.product is not undefined or null
            if (!item || !item.product) {
                console.warn('Encountered undefined or null product in wishlist item:', item);
                return true; // Skip invalid items
            }
            return item.product.toString() !== productIdStr;
        });

        // Check if any product was actually removed
        if (updatedWishItems.length === wishlist.wishItems.length) {
            return res.status(404).json({ msg: 'Product not found in wishlist' });
        }

        wishlist.wishItems = updatedWishItems;
        await wishlist.save();

        return res.status(200).json({ msg: 'Product removed from wishlist successfully', wishlist });
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
};


// Controller method to fetch wishlist items for a user
exports.getWishlistItems = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Find the wishlist for the user
        const wishlist = await Wishlist.findOne({ user: userId }).populate('wishItems.product');

        if (!wishlist) {
            return res.status(404).json({ msg: 'Wishlist not found' });
        }

        return res.status(200).json({ wishlist });
    } catch (error) {
        console.error('Error fetching wishlist items:', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
};
