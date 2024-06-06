const userCollection = require("../model/users");
const Category = require("../model/category");
const Product = require("../model/product");
const ProductOffer = require("../model/productOffer");
const categoryOffer =require('../model/categoryOffer')
const WishList = require("../model/wishlist");

// const multer = require('multer');


module.exports = {
  
  getAddProduct: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("addProduct", { categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error getting addproduct page");
    }
  },

  getProductManagement: async (req, res) => {
    console.log("HELLLLL");
    try {
      console.log("reached product get route");
      const products = await Product.find({}).populate("category");

      console.log("pr list", products);
      res.render("productmanagement", { products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get products. please try again");
    }
  },

  postAddProduct: async (req, res) => {
    const {
      productname,
      category,
      price,
      Brand,
      description,
      stock,
      croppedImages,
    } = req.body;

    try {
      const newProduct = new Product({
        productname: productname,
        category: category,
        price: price,
        brand: Brand,
        description: description,
        image: croppedImages || [],
        stock: stock,
        isListed: true,
      });

      // Save the new product
      await newProduct.save();

      // Update the isListed status of the associated category
      if (category) {
        const associatedCategory = await Category.findById(category);
        if (associatedCategory) {
          associatedCategory.islisted = true; // Update based on your logic
          await associatedCategory.save();
        }
      }

      res.redirect("/productmanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error adding product");
    }
  },

  getEditProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id }).populate(
        "category"
      );
      const categories = await Category.find();
      res.render("editProduct", { product, categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get product edit page.");
    }
  },

  postEditProduct: async (req, res) => {
    const id = req.params.id;
    const {
      productname,
      category,
      price,
      brand,
      description,
      stock,
      isListed,
    } = req.body;
    try {
      let updatedImagePaths = [];
      if (req.files && req.files.length > 0) {
        updatedImagePaths = req.files.map((file) => file.path.substring(6));
      } else {
        let existingImage = await Product.findById(id);
        let imageArray = existingImage.image;
        updatedImagePaths = imageArray;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          productname: productname,
          category: category,
          price: price,
          brand: brand,
          description: description,
          image: updatedImagePaths,

          stock: stock,
          isListed: isListed,
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).send("Product not found");
      }

      // Update the isListed status of the old category if it's changed
      if (updatedProduct.category) {
        const oldCategory = await Category.findById(updatedProduct.category);
        if (oldCategory) {
          oldCategory.islisted = true; // Update based on your logic
          await oldCategory.save();
        }
      }

      // Update the isListed status of the new category
      if (category) {
        const newCategory = await Category.findById(category);
        if (newCategory) {
          newCategory.islisted = true; // Update based on your logic
          await newCategory.save();
        }
      }

      res.redirect("/productmanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error updating product");
    }
  },

  getproductdelete: async (req, res) => {
    const pid = req.params.id;
    console.log("id is", pid);
    const deleteproduct = await Product.findByIdAndDelete(pid)
      .then((x) => {
        console.log("product deleted", x);
        res.redirect("/productmanagement");
      })
      .catch((x) => {
        console.log("error in deletion");
        res.redirect("/productmanagement");
      });
  },
  getUnlistProduct: async (req, res) => {
    try {
      const productId = req.params.id;

      // Find the product by ID
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send("Product not found");
      }

      // Toggle the isListed status of the product
      product.isListed = !product.isListed;

      // Save the updated product
      await product.save();

      // If the product has a category, find all products with the same category and update their isListed status
      if (product.category) {
        await Product.updateOne(
          { category: product.category },
          { isListed: product.isListed }
        );
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error changing product status");
    }
    res.redirect("/productmanagement");
  },


  
  getproduct : async (req, res) => {
    const pid = req.params.id;
    try {
      console.log('entered get product get')
      const product = await Product.findById(pid).populate("category");
      console.log("product in product detail is",product)
      if (!product) {
        return res.status(404).send("Product not found");
      }
  
      // Check if the product has a category before accessing its _id property
      if (!product.category) {
        return res.status(404).send("Product category not found");
      }
  
      // Check if there is already an offer for the product
      const pname = product.productname;
      const poffer = await ProductOffer.findOne({ productname: pname });
      console.log("product offer is", poffer);
  
      let discountAmount = 0;
  
      // If there is a product offer, calculate its discount
      if (poffer) {
        const originalPrice = parseFloat(product.price);
        const discountPercentage = parseFloat(poffer.productoffer);
        discountAmount = (originalPrice * discountPercentage) / 100;
  
        console.log('product offer is ', poffer);
      }
  
      // Check if there is already a category offer for the product's category
      const CategoryOffer = await categoryOffer.findOne({ category: product.category.category });
      console.log("this is the category offer", CategoryOffer);
  
      // If there is a category offer, calculate its discount
      if (CategoryOffer) {
        const originalPrice = parseFloat(product.price);
        const discountPercentage = parseFloat(CategoryOffer.alloffer);
        const categoryDiscountAmount = (originalPrice * discountPercentage) / 100;
        console.log("originalPrice", originalPrice);
        console.log("discountPercentage", discountPercentage);
        console.log("categoryDiscountAmount", categoryDiscountAmount);
  
        // If the category offer provides a higher discount than the product offer, update discountAmount
        if (categoryDiscountAmount > discountAmount) {
          discountAmount = categoryDiscountAmount;
        }
      }
  
      // Calculate the discounted price
      const discountedPrice = parseFloat(product.price) - discountAmount;
  
      // Fetch related products
      const relatedProducts = await Product.find({ category: product.category._id })
        .limit(5)
        .populate("category");
  
      // Check if the product is in the user's wishlist
      let isInWishlist = false;
      const userId = req.session.userid;
      if (userId) {
        const wishlistItem = await WishList.findOne({ userid: userId, productid: pid });
        isInWishlist = !!wishlistItem;
      }
  
      res.render("productDetails", { 
        product, 
        relatedProducts, 
        poffer,
        discount: discountedPrice,
        discountamount: discountAmount,
        isInWishlist,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  


  deleteimage: async (req, res) => {
    console.log("enterr");
    const productId = req.body.productId;
    const imageIndex = req.body.imageIndex;
    try {
      console.log("HOY");
      const product = await Product.findById(productId);
      console.log("product data", product);
      if (!product) {
        return res.status(404).send("Product not found");
      }
      if (imageIndex < 0 || imageIndex >= product.image.length) {
        return res.status(400).send("Invalid image index");
      }
      product.image.splice(imageIndex, 1);
      await product
        .save()
        .then((c) => {
          console.log("delteed");
          res.status(200).send("Image removed successfully");
        })
        .catch((c) => {
          console.log("errror", c);
        });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },

  productfilter: async (req, res) => {
    try {
      const categories = await Category.find();
      console.log(categories, "this is the categories");
      // Retrieve filtering parameters from the form submission
      const {
        category,
        sortprice,
        priceRange,
        sortAlphabetically,
        page = 1,
      } = req.body;

      // Construct your query based on the received parameters
      const query = buildQuery(category, priceRange);

      // Define pagination constants
      const PAGE_SIZE = 4; // Number of products per page

      // Get current page from query parameters, default to 1 if not provided
      const currentPage = parseInt(page) || 1;

      // Calculate skip value based on current page and page size
      const skip = (currentPage - 1) * PAGE_SIZE;

      if (req.session.userid) {
        // Fetch products based on the constructed query and sort options with pagination
        const products = await Product.find(query)
          .sort(buildSortOption(sortprice, sortAlphabetically))
          .skip(skip)
          .limit(PAGE_SIZE);

        // Count total documents matching the query
        const totalCount = await Product.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);

        // Render your view with the filtered, sorted, and paginated products
        res.render("allProducts", {
          productcollection: products,
          currentPage,
          totalPages,
          sortprice,
          sortAlphabetically,
          category,
          priceRange,
          categories: categories,
        });
      } else {
        // Handle the case when user is not authenticated
        res.status(401).send("Unauthorized");
      }
    } catch (error) {
      // Handle any errors
      console.error("Error fetching products:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

// Helper function to build query based on filter parameters
const buildQuery = (category, priceRange) => {
  let query = { isListed: true, stock: { $gt: 1 } };
  if (category && category !== "All Categories") {
    query.category = category;
  }
  if (priceRange && priceRange !== "All Prices") {
    const [minPrice, maxPrice] = priceRange.split("-").map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }
  return query;
};

// Helper function to build sort option based on filter parameters
const buildSortOption = (sortprice, sortAlphabetically) => {
  let sortOption = {};
  if (sortprice === "lowToHigh") {
    sortOption.price = 1; // Sort by ascending price
  } else if (sortprice === "highToLow") {
    sortOption.price = -1; // Sort by descending price
  }
  if (sortAlphabetically === "ascending") {
    sortOption.productname = 1; // Sort by ascending alphabetical order of product names
  } else if (sortAlphabetically === "descending") {
    sortOption.productname = -1; // Sort by descending alphabetical order of product names
  }
  return sortOption;
};
