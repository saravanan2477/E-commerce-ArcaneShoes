const userCollection = require("../model/users");
 const Category = require("../model/category");
const Product = require("../model/product");

// const multer = require('multer');


module.exports = {

  getAddProduct: async (req, res) => {
    try {

      const categories = await Category.find();
      res.render("addProduct",{categories});
    } catch (err) { 
      console.error(err);
      return res.status(500).send("Error getting addproduct page");
    }
  },

  getProductManagement: async (req, res) => {
    console.log("HELLLLL");
    try {
      console.log("reached product get route")
      const products = await Product.find({}).populate("category");
     
      console.log('pr list',products);
      res.render("productmanagement", { products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get products. please try again");
    }
  },

  
  
  postAddProduct: async (req, res) => {
    const { productname, category, price, model, discription, stock } =
      req.body;
      console.log("form data",req.body)
     const newProduct = new Product({
      productname: productname,
      category: category,
      price: price,
      model: model,
      description: discription,
      image: req.files.map((file) => file.path.substring(6)),
      stock: stock,
      isListed: true,
    });
    newProduct.save()
    .then(c=>{
      console.log('inserted',c);
       res.redirect("/admin/productmanagement");
    })
    .catch(c=>{
      console.log('error',c);
    })
   
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
    console.log('enter here',req.files);
    const value = await Product.findByIdAndUpdate(id, {
      productname: req.body.productname,
        category: req.body.category,
        price: req.body.price,
        model: req.body.model,
        description: req.body.description,
        stock: req.body.stock,
        isListed: req.body.isListed
    }, { new: true })
    try {
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.path.substring(6))
        value.image = value.image.concat(newImages);
      }
      if (!value) {
        console.log("Product not found");
        res.status(404).send("Product not found");
        return;
      }
      await value.save()
      .then(s=>{
        console.log('updated',s);
        res.redirect("/admin/productmanagement");

      })
       .catch(c=>{
         res.status(404).send(c);

       })
        
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product. Please try again later.");
        }    }
,
  getproductdelete: async (req, res) => {
    const pid=req.params.id
    console.log(
      'id is',pid
    ); 
      const deleteproduct=await Product.findByIdAndDelete(pid)
      .then(x=>{
        console.log('product deleted',x)
        res.redirect('/admin/productmanagement')
      })
      .catch(x=>{
        console.log('error in deletion');
        res.redirect('/productmanagement')
      })

    }
,

  getUnlistProduct: async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    try {
      product.isListed = !product.isListed;
      product.save();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error changing product status");
    }
    res.redirect("/admin/productmanagement");
  },
  getproduct: async (req, res) => {
    const pid = req.params.id;
    const product = await Product.findById(pid).populate('category');
    // Fetch related products
    const relatedProducts = await Product.find({ category: product.category._id }).limit(5);
    res.render('productDetails', { product, relatedProducts });
},

  deleteimage: async (req, res) => {
    console.log('enterr');
    const productId = req.body.productId;
    const imageIndex = req.body.imageIndex;
    try {
      console.log("HOY");
      const product = await Product.findById(productId);
      console.log('product data',product);
      if (!product) {
        return res.status(404).send('Product not found');
      }
      if (imageIndex < 0 || imageIndex >= product.image.length) {
        return res.status(400).send('Invalid image index');
      }
      product.image.splice(imageIndex, 1);
      await product.save()
      .then(c=>{
        console.log('delteed');
        res.status(200).send('Image removed successfully');
      }).catch(c=>{
        console.log(
          'errror',
          c
        );
      })
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  },


   productfilter : async (req, res) => {
    try {
      // Retrieve filtering parameters from the form submission
      const { category, sortprice, priceRange, sortAlphabetically, page = 1 } = req.body;
  
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
        const products = await Product
          .find(query)
          .sort(buildSortOption(sortprice, sortAlphabetically))
          .skip(skip)
          .limit(PAGE_SIZE);
  
        // Count total documents matching the query
        const totalCount = await Product.countDocuments(query);
  
        // Calculate total pages
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  
        // Render your view with the filtered, sorted, and paginated products
        res.render('allProducts', {
          productcollection: products,
          currentPage,
          totalPages,
          sortprice,
          sortAlphabetically,
          category,
          priceRange
        });
      } else {
        // Handle the case when user is not authenticated
        res.status(401).send('Unauthorized');
      }
    } catch (error) {
      // Handle any errors
      console.error('Error fetching products:', error);
      res.status(500).send('Internal Server Error');
    }
  }
  
}

// Helper function to build query based on filter parameters
const buildQuery = (category, priceRange) => {
  let query = { isListed: true, stock: { $gt: 1 } };
  if (category && category !== 'All Categories') {
    query.category = category;
  }
  if (priceRange && priceRange !== 'All Prices') {
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }
  return query;
}

// Helper function to build sort option based on filter parameters
const buildSortOption = (sortprice, sortAlphabetically) => {
  let sortOption = {};
  if (sortprice === 'lowToHigh') {
    sortOption.price = 1; // Sort by ascending price
  } else if (sortprice === 'highToLow') {
    sortOption.price = -1; // Sort by descending price
  }
  if (sortAlphabetically === 'ascending') {
    sortOption.productname = 1; // Sort by ascending alphabetical order of product names
  } else if (sortAlphabetically === 'descending') {
    sortOption.productname = -1; // Sort by descending alphabetical order of product names
  }
  return sortOption;
}