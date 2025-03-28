const Product = require("../models/Product");
const mongoose = require("mongoose");

// Chuẩn hóa phản hồi API
const createResponse = (status, code, message, data = null) => {
  return { status, code, message, data };
};

// Lấy tất cả sản phẩm
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    console.log("Đã lấy được tất cả sản phẩm");

    res.status(200).json(createResponse("success", 200, "Lấy danh sách sản phẩm thành công!", products));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json(createResponse("error", 500, "Lỗi khi lấy danh sách sản phẩm!"));
  }
};

// Lấy sản phẩm theo barcode
const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findOne({ "meta.barcode": barcode });

    if (!product) {
      console.log(`Không tìm thấy sản phẩm với barcode: ${barcode}`);
      return res.status(404).json(createResponse("error", 404, "Không tìm thấy sản phẩm!"));
    }

    console.log(`Đã lấy được sản phẩm với barcode: ${barcode}`);
    res.status(200).json(createResponse("success", 200, "Lấy sản phẩm thành công!", product));
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json(createResponse("error", 500, "Lỗi khi lấy sản phẩm!"));
  }
};


// Lấy sản phẩm theo mảng ID
const getProductsByIds = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json(createResponse("error", 400, "Danh sách productIds không hợp lệ!"));
    }

    // Chuyển đổi các ID thành ObjectId hợp lệ
    const validObjectIds = productIds
      .filter(id => mongoose.Types.ObjectId.isValid(id)) // Kiểm tra hợp lệ
      .map(id => new mongoose.Types.ObjectId(id)); // Chuyển thành ObjectId

    if (validObjectIds.length === 0) {
      return res.status(400).json(createResponse("error", 400, "Không có ObjectId hợp lệ!"));
    }

    // Truy vấn danh sách sản phẩm theo ObjectId
    const products = await Product.find({ _id: { $in: validObjectIds } });

    console.log(`Đã lấy được ${products.length} sản phẩm từ danh sách ID`);

    res.status(200).json(createResponse("success", 200, "Lấy sản phẩm thành công!", products));
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json(createResponse("error", 500, "Lỗi khi lấy sản phẩm!"));
  }
};

// Lưu sản phẩm vào cơ sở dữ liệu
const createProduct = async (req, res) => {
  try {
    const { title, expiryDate, images } = req.body;

    if (!title || !expiryDate || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json(createResponse("error", 400, "Thiếu thông tin sản phẩm hoặc danh sách ảnh không hợp lệ!"));
    }

    const newProduct = new Product({
      title,
      expiryDate,
      images,
    });

    await newProduct.save();

    console.log(`Sản phẩm đã được lưu: ${newProduct.id}`);
    res.status(201).json(createResponse("success", 201, "Sản phẩm đã được lưu!", newProduct));
  } catch (error) {
    console.error("Lỗi khi lưu sản phẩm:", error);
    res.status(500).json(createResponse("error", 500, "Lỗi khi lưu sản phẩm!"));
  }
};

// Xóa sản phẩm theo ID
const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(createResponse("error", 400, "ID không hợp lệ!"));
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json(createResponse("error", 404, "Không tìm thấy sản phẩm!"));
    }

    console.log(`Sản phẩm đã bị xóa: ${id}`);
    res.status(200).json(createResponse("success", 200, "Xóa sản phẩm thành công!", deletedProduct));
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json(createResponse("error", 500, "Lỗi khi xóa sản phẩm!"));
  }
};

module.exports = { getProducts, getProductByBarcode, getProductsByIds, createProduct, deleteProductById };



