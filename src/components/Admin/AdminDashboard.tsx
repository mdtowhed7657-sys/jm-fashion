import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  ShoppingBag,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  DollarSign,
  Package,
  Check,
  Phone,
  Eye,
  Download,
  Search,
  Layers,
  TrendingUp,
  Clock,
  CheckCircle2,
  CheckCircle,
  Truck,
  MessageCircle,
  ChevronRight,
  Menu,
  ExternalLink,
  Filter,
  BarChart3,
  Tag,
  Sparkles,
  Sliders,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  LogOut,
  UserCheck,
  RefreshCw,
  Upload
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { uploadImageToFirebaseStorage } from '../../lib/firebase';
import { ColorVariant, OrderStatus, Order, ProductImage, Product } from '../../types';
import { WHATSAPP_PHONE_DISPLAY } from '../../utils/whatsapp';
import { toBengaliNumber } from '../../utils/pricing';
import { HeroBannerManagement } from './HeroBannerManagement';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    product,
    selectedProductId,
    setSelectedProductId,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    isAdminOpen,
    setIsAdminOpen,
    updateProductInfo,
    addColorVariant,
    updateColorVariant,
    deleteColorVariant,
    addColorImage,
    deleteColorImage,
    updateOrderStatus,
    deleteOrder,
    resetProductToDefaults,
    isHeroBannerEnabled,
    logoutAdmin,
    adminUser,
    navigate,
    isAdminAuthenticated
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'colors' | 'hero_banner' | 'pricing' | 'product'>('overview');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);

  // Admin selected product for tab editing
  const [adminSelectedProductId, setAdminSelectedProductId] = useState<string>(
    selectedProductId || products[0]?.id || product.id
  );
  const currentManagedProduct = products.find((p) => p.id === adminSelectedProductId) || product;

  // Deletion Confirmation Modal States
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState<boolean>(false);

  const [imageToDelete, setImageToDelete] = useState<{ colorId: string; colorNameBn: string; image: ProductImage } | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState<boolean>(false);

  const [colorVariantToDelete, setColorVariantToDelete] = useState<ColorVariant | null>(null);
  const [isDeletingColor, setIsDeletingColor] = useState<boolean>(false);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState<boolean>(false);

  const [showProductResetModal, setShowProductResetModal] = useState<boolean>(false);
  const [isResettingProduct, setIsResettingProduct] = useState<boolean>(false);

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdNameBn, setNewProdNameBn] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>('blouse');
  const [newProdBasePrice, setNewProdBasePrice] = useState<number>(120);
  const [newProdBundlePrice, setNewProdBundlePrice] = useState<number>(500);
  const [newProdColorName, setNewProdColorName] = useState<string>('Maroon');
  const [newProdColorNameBn, setNewProdColorNameBn] = useState<string>('মেরুন');
  const [newProdColorCode, setNewProdColorCode] = useState<string>('#800020');
  const [newProdImageUrl, setNewProdImageUrl] = useState<string>('');
  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);

  // Premium Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Editing Product states for currentManagedProduct
  const [productName, setProductName] = useState(currentManagedProduct.name);
  const [productNameBn, setProductNameBn] = useState(currentManagedProduct.nameBn);
  const [productCategory, setProductCategory] = useState(currentManagedProduct.category || '');
  const [productIsVisible, setProductIsVisible] = useState(currentManagedProduct.isVisible ?? true);
  const [taglineBn, setTaglineBn] = useState(currentManagedProduct.taglineBn || '');
  const [basePrice, setBasePrice] = useState(currentManagedProduct.basePrice || 120);
  const [baseRegularPrice, setBaseRegularPrice] = useState(currentManagedProduct.baseRegularPrice || 160);
  const [bundleQuantity, setBundleQuantity] = useState(currentManagedProduct.bundleQuantity || 5);
  const [bundlePrice, setBundlePrice] = useState(currentManagedProduct.bundlePrice || 500);
  const [bundleOfferBadgeBn, setBundleOfferBadgeBn] = useState(currentManagedProduct.bundleOfferBadgeBn || '🔥 Best Deal (১০০৳ সেভ)');
  const [deliveryFeeInsideDhaka, setDeliveryFeeInsideDhaka] = useState(currentManagedProduct.deliveryFeeInsideDhaka ?? 100);
  const [deliveryFeeOutsideDhaka, setDeliveryFeeOutsideDhaka] = useState(currentManagedProduct.deliveryFeeOutsideDhaka ?? 130);
  const [descriptionBn, setDescriptionBn] = useState(currentManagedProduct.descriptionBn);
  const [offerTextBn, setOfferTextBn] = useState(currentManagedProduct.offerTextBn);

  useEffect(() => {
    if (currentManagedProduct) {
      setProductName(currentManagedProduct.name);
      setProductNameBn(currentManagedProduct.nameBn);
      setProductCategory(currentManagedProduct.category || '');
      setProductIsVisible(currentManagedProduct.isVisible ?? true);
      setTaglineBn(currentManagedProduct.taglineBn || '');
      setBasePrice(currentManagedProduct.basePrice || 120);
      setBaseRegularPrice(currentManagedProduct.baseRegularPrice || 160);
      setBundleQuantity(currentManagedProduct.bundleQuantity || 5);
      setBundlePrice(currentManagedProduct.bundlePrice || 500);
      setBundleOfferBadgeBn(currentManagedProduct.bundleOfferBadgeBn || '🔥 Best Deal (১০০৳ সেভ)');
      setDeliveryFeeInsideDhaka(currentManagedProduct.deliveryFeeInsideDhaka ?? 100);
      setDeliveryFeeOutsideDhaka(currentManagedProduct.deliveryFeeOutsideDhaka ?? 130);
      setDescriptionBn(currentManagedProduct.descriptionBn);
      setOfferTextBn(currentManagedProduct.offerTextBn);
    }
  }, [adminSelectedProductId, currentManagedProduct]);

  // Add Color modal states
  const [showAddColorModal, setShowAddColorModal] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorNameBn, setNewColorNameBn] = useState('');
  const [newColorHex, setNewColorHex] = useState('#800020');
  const [newColorPrice, setNewColorPrice] = useState(120);
  const [newColorStock, setNewColorStock] = useState(25);
  const [newColorImgUrl, setNewColorImgUrl] = useState('');

  // Add Image modal per color
  const [selectedColorForImg, setSelectedColorForImg] = useState<ColorVariant | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const handleFileUploadForInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('অনুগ্রহ করে সঠিক ফরম্যাটের ছবি নির্বাচন করুন', 'error');
      return;
    }

    setIsUploadingImage(true);
    showToast('ফায়ারবেস স্টোরেজে ছবি আপলোড হচ্ছে...', 'info');

    try {
      const uploadedUrl = await uploadImageToFirebaseStorage(file, 'products');
      setUrl(uploadedUrl);
      showToast('ছবি সফলভাবে ফায়ারবেসে আপলোড এবং লিঙ্ক হয়েছে!', 'success');
    } catch (err: any) {
      console.error('Image upload failed:', err);
      showToast(`ছবি আপলোড করা যায়নি: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Confirm Delete Order Handler
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeletingOrder(true);
    try {
      const orderIdentifier = orderToDelete.id || orderToDelete.orderNumber;
      await deleteOrder(orderIdentifier);
      const orderNum = orderToDelete.orderNumber || orderToDelete.id;
      if (
        selectedOrderForView &&
        (selectedOrderForView.id === orderToDelete.id || selectedOrderForView.orderNumber === orderToDelete.orderNumber)
      ) {
        setSelectedOrderForView(null);
      }
      setOrderToDelete(null);
      showToast(`Order #${orderNum} সফলভাবে স্থায়ীভাবে ডিলিট করা হয়েছে!`, 'success');
    } catch (err: any) {
      showToast(`ডিলিট ব্যর্থ হয়েছে: ${err.message || 'সমস্যা হয়েছে'}`, 'error');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  // Confirm Delete Product Handler
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    if (products.length <= 1) {
      showToast('কমপক্ষে ১টি প্রডাক্ট থাকতে হবে, এটি ডিলিট করা যাবে না!', 'error');
      setProductToDelete(null);
      return;
    }
    setIsDeletingProduct(true);
    try {
      await deleteProduct(productToDelete.id);
      const deletedName = productToDelete.nameBn || productToDelete.name;
      setProductToDelete(null);
      const remaining = products.filter((p) => p.id !== productToDelete.id);
      if (remaining[0]) {
        setAdminSelectedProductId(remaining[0].id);
      }
      showToast(`প্রডাক্ট "${deletedName}" সফলভাবে ডিলিট করা হয়েছে!`, 'success');
    } catch (err: any) {
      showToast(`প্রডাক্ট ডিলিট ব্যর্থ হয়েছে: ${err.message || 'Error occurred'}`, 'error');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Confirm Delete Image Handler
  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;
    setIsDeletingImage(true);
    try {
      await deleteColorImage(imageToDelete.colorId, imageToDelete.image.id, currentManagedProduct.id);
      const colorName = imageToDelete.colorNameBn;
      setImageToDelete(null);
      showToast(`"${colorName}" কালার থেকে ছবিটি সফলভাবে মুছে ফেলা হয়েছে!`, 'success');
    } catch (err: any) {
      showToast(`ছবি ডিলিট ব্যর্থ হয়েছে: ${err.message || 'Error occurred'}`, 'error');
    } finally {
      setIsDeletingImage(false);
    }
  };

  // Confirm Delete Color Variant Handler
  const confirmDeleteColorVariant = async () => {
    if (!colorVariantToDelete) return;
    setIsDeletingColor(true);
    try {
      await deleteColorVariant(colorVariantToDelete.id, currentManagedProduct.id);
      const name = colorVariantToDelete.nameBn;
      setColorVariantToDelete(null);
      showToast(`"${name}" কালার ভ্যারিয়েন্টটি সফলভাবে ডিলিট করা হয়েছে!`, 'success');
    } catch (err: any) {
      showToast(`কালার ডিলিট ব্যর্থ হয়েছে: ${err.message || 'Error occurred'}`, 'error');
    } finally {
      setIsDeletingColor(false);
    }
  };

  // Confirm Reset Product Handler
  const confirmResetProduct = async () => {
    setIsResettingProduct(true);
    try {
      await resetProductToDefaults();
      setShowProductResetModal(false);
      showToast(`প্রডাক্ট ও ছবি ডিফল্ট সেটিংসে রিসেট করা হয়েছে! (কাস্টমার অর্ডার সুরক্ষিত রয়েছে)`, 'success');
    } catch (err: any) {
      showToast(`প্রডাক্ট রিসেট ব্যর্থ হয়েছে: ${err.message || 'Error occurred'}`, 'error');
    } finally {
      setIsResettingProduct(false);
    }
  };

  // Handle Create New Product
  const handleCreateNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdNameBn.trim()) {
      alert('অনুগ্রহ করে প্রডাক্টের বাংলা নাম প্রদান করুন');
      return;
    }
    if (!newProdImageUrl.trim()) {
      alert('অনুগ্রহ করে প্রডাক্টের একটি ছবি ফাইল আপলোড করুন অথবা ছবির লিঙ্ক প্রদান করুন');
      return;
    }
    setIsCreatingProduct(true);
    try {
      const created = await addProduct({
        name: newProdName.trim() || newProdNameBn.trim(),
        nameBn: newProdNameBn.trim(),
        category: newProdCategory.trim() || 'blouse',
        basePrice: Number(newProdBasePrice) || 120,
        baseRegularPrice: Math.round((Number(newProdBasePrice) || 120) * 1.3),
        bundleQuantity: 5,
        bundlePrice: Number(newProdBundlePrice) || 500,
        bundleOfferBadgeBn: '🔥 Best Deal (১০০৳ সেভ)',
        deliveryFeeInsideDhaka: 100,
        deliveryFeeOutsideDhaka: 130,
        descriptionBn: 'প্রিমিয়াম কোয়ালিটি জ্যাকার্ড ও কটন ফেব্রিক দিয়ে তৈরি। ফ্রি সাইজ, যেকোনো সাইজের সাথে আরামদায়ক ফিট।',
        offerTextBn: 'স্পেশাল ধামাকা অফার: ১ পিস ১২০৳ | ৫ পিস মাত্র ৫০০৳!',
        isVisible: true,
        sizes: ['Free Size'],
        colors: [
          {
            id: 'color-' + Date.now(),
            name: newProdColorName.trim() || 'Maroon',
            nameBn: newProdColorNameBn.trim() || 'মেরুন',
            code: newProdColorCode || '#800020',
            priceOverride: Number(newProdBasePrice) || 120,
            regularPriceOverride: 160,
            stock: 25,
            availableSizes: ['Free Size'],
            isEnabled: true,
            images: [
              {
                id: 'img-' + Date.now(),
                url: newProdImageUrl.trim(),
                alt: `${newProdNameBn} View`,
                isMain: true
              }
            ]
          }
        ]
      });
      setAdminSelectedProductId(created.id);
      setShowAddProductModal(false);
      setNewProdName('');
      setNewProdNameBn('');
      setNewProdImageUrl('');
      showToast(`নতুন প্রডাক্ট "${created.nameBn}" সফলভাবে তৈরি হয়েছে!`, 'success');
    } catch (err: any) {
      showToast(`প্রডাক্ট তৈরি ব্যর্থ হয়েছে: ${err.message || 'Error occurred'}`, 'error');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  if (!isAdminOpen) return null;

  // Filtered Orders Calculation
  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = selectedOrderFilter === 'all' ? true : ord.status === selectedOrderFilter;
    const matchesQuery = searchQuery === '' ? true : (
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customer.phone.includes(searchQuery) ||
      (ord.customer.address && ord.customer.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return matchesFilter && matchesQuery;
  });

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const confirmedOrdersCount = orders.filter(o => o.status === 'confirmed').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'shipped').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;
  const totalStockCount = currentManagedProduct.colors.reduce((sum, c) => sum + (c.stock || 0), 0);

  // Save Product Main Info & Pricing
  const handleSaveProductMain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProductInfo({
        name: productName,
        nameBn: productNameBn,
        category: productCategory,
        isVisible: productIsVisible,
        taglineBn,
        basePrice: Number(basePrice),
        baseRegularPrice: Number(baseRegularPrice),
        bundleQuantity: Number(bundleQuantity),
        bundlePrice: Number(bundlePrice),
        bundleOfferBadgeBn,
        deliveryFeeInsideDhaka: Number(deliveryFeeInsideDhaka),
        deliveryFeeOutsideDhaka: Number(deliveryFeeOutsideDhaka),
        descriptionBn,
        offerTextBn
      }, currentManagedProduct.id);
      showToast(`"${productNameBn}" এর তথ্য, অফার ও সেটিংস ফায়ারবেসে সফলভাবে সেভ হয়েছে!`, 'success');
    } catch (err: any) {
      showToast(`ফায়ারবেসে সেভ করতে সমস্যা হয়েছে: ${err.message || 'Error'}`, 'error');
    }
  };

  // Handle Add New Color
  const handleAddColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim() || !newColorNameBn.trim()) {
      alert('অনুগ্রহ করে কালারের নাম প্রদান করুন।');
      return;
    }
    if (!newColorImgUrl.trim()) {
      alert('অনুগ্রহ করে কালারের একটি ছবি ফাইল আপলোড করুন অথবা ছবির লিঙ্ক প্রদান করুন');
      return;
    }

    const imgUrl = newColorImgUrl.trim();

    try {
      await addColorVariant({
        name: newColorName,
        nameBn: newColorNameBn,
        code: newColorHex,
        priceOverride: Number(newColorPrice),
        regularPriceOverride: Number(baseRegularPrice),
        stock: Number(newColorStock),
        availableSizes: ['Free Size'],
        isEnabled: true,
        images: [
          {
            id: 'img-' + Date.now(),
            url: imgUrl,
            alt: `${newColorName} View`,
            isMain: true
          }
        ]
      }, currentManagedProduct.id);

      setNewColorName('');
      setNewColorNameBn('');
      setNewColorImgUrl('');
      setShowAddColorModal(false);
      showToast(`"${currentManagedProduct.nameBn}" এ নতুন কালার "${newColorNameBn}" সফলভাবে সেভ হয়েছে!`);
    } catch (err: any) {
      showToast(`কালার যোগ করতে সমস্যা হয়েছে: ${err.message || 'Error'}`, 'error');
    }
  };

  // Handle Add Image to Color
  const handleAddImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColorForImg || !newImageUrl.trim()) return;

    try {
      await addColorImage(selectedColorForImg.id, newImageUrl.trim(), false, currentManagedProduct.id);
      const colorName = selectedColorForImg.nameBn;
      setNewImageUrl('');
      setSelectedColorForImg(null);
      showToast(`"${colorName}" কালারে নতুন ছবি সফলভাবে সেভ হয়েছে!`);
    } catch (err: any) {
      showToast(`ছবি যোগ করতে সমস্যা হয়েছে: ${err.message || 'Error'}`, 'error');
    }
  };

  // Export Orders CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('কোনো অর্ডার পাওয়া যায়নি!');
      return;
    }
    let csv = 'Order ID,Customer Name,Phone,Address,Delivery Zone,Selected Color,Size,Quantity,Bundle Applied,Subtotal,Delivery Fee,Total Amount,Payment,Status,Date\n';
    orders.forEach((o) => {
      const item = o.items[0];
      const zoneLabel = o.customer.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka (ঢাকা)' : 'Outside Dhaka (ঢাকার বাইরে)';
      csv += `"${o.orderNumber}","${o.customer.name.replace(/"/g, '""')}","${o.customer.phone}","${o.customer.address.replace(/"/g, '""')}","${zoneLabel}","${item?.colorNameBn || ''}","${item?.size || ''}",${item?.quantity || 1},"${item?.appliedBundle ? 'Yes' : 'No'}",${o.subtotal},${o.deliveryFee},${o.totalAmount},"${o.paymentMethod}","${o.status}","${new Date(o.createdAt).toLocaleString()}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JM_FASHION_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Generate Direct WhatsApp link for a customer
  const createCustomerWhatsAppUrl = (order: Order) => {
    const phone = order.customer.phone.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('88') ? phone : `88${phone}`;
    const message = encodeURIComponent(
      `আসসালামু আলাইকুম ${order.customer.name},\nJM FASHION থেকে আপনার অর্ডার #${order.orderNumber} এর বিষয়ে যোগাযোগ করা হচ্ছে।\n- পণ্য: ${order.items[0]?.productName || 'JM Exclusive Collection'}\n- কালার: ${order.items[0]?.colorNameBn}\n- পরিমাণ: ${order.items[0]?.quantity} পিস\n- মোট বিল: ৳${order.totalAmount}\n- বর্তমান স্ট্যাটাস: ${order.status.toUpperCase()}\n\nকোনো প্রশ্ন থাকলে আমাদের জানাতে পারেন। ধন্যবাদ!`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  const navItems = [
    { id: 'overview', label: 'ড্যাশবোর্ড ওভারভিউ', labelEn: 'Overview', icon: BarChart3, badge: null },
    { id: 'products', label: 'প্রোডাক্টস (৩টি কালেকশন)', labelEn: 'Products', icon: Package, badge: `${products.length}টি`, badgeColor: 'bg-pink-100 text-pink-800' },
    { id: 'hero_banner', label: 'হিরো অফার ব্যানার', labelEn: 'Hero Banners', icon: Sparkles, badge: isHeroBannerEnabled ? 'অন' : 'অফ', badgeColor: isHeroBannerEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600' },
    { id: 'orders', label: 'অর্ডার ম্যানেজমেন্ট', labelEn: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null, badgeColor: 'bg-rose-500 text-white' },
    { id: 'colors', label: 'কালার ভ্যারিয়েন্ট ও ছবি', labelEn: 'Colors & Images', icon: Layers, badge: `${currentManagedProduct.colors.length}`, badgeColor: 'bg-pink-100 text-pink-800' },
    { id: 'pricing', label: 'প্রাইসিং ও বান্ডেল অফার', labelEn: 'Pricing & Bundle', icon: Tag, badge: '500৳', badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'product', label: 'প্রডাক্ট বিবরণ ও সেটিংস', labelEn: 'Product Info', icon: Sliders, badge: null }
  ];

  if (!isAdminOpen || !isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="bg-[#FAF9F6] border border-stone-200/90 rounded-3xl w-full max-w-7xl h-[94vh] max-h-[900px] overflow-hidden shadow-2xl flex flex-col text-stone-900"
      >
        {/* Top Management Bar */}
        <header className="bg-white px-4 sm:px-6 py-3.5 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
                JM
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm sm:text-base font-serif font-bold text-stone-900 tracking-wide">
                    JM FASHION Management Panel
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Authenticated
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block">
                  সিঙ্গেল প্রডাক্ট + ১৫টি কালার ভ্যারিয়েন্ট ও রিয়েল-টাইম কাস্টমার অর্ডার কন্ট্রোল
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Admin User Identifier */}
            <div className="hidden xl:flex items-center space-x-1.5 bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-medium text-stone-700">{adminUser?.email || 'JM Admin'}</span>
            </div>

            {/* View Live Store Button */}
            <button
              onClick={() => {
                setIsAdminOpen(false);
                navigate('/');
              }}
              className="hidden md:flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>লাইভ ওয়েবসাইট দেখুন</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={async () => {
                await logoutAdmin();
              }}
              className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer border border-rose-200/80"
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>

            {/* Exit Admin Button */}
            <button
              onClick={() => {
                setIsAdminOpen(false);
                navigate('/');
              }}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Close Admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Body with Sidebar + Tab Content */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Desktop Left Sidebar & Mobile Drawer */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200/90 flex flex-col justify-between p-3 sm:p-4 transition-transform duration-200 ease-in-out
              ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 flex items-center justify-between">
                <span>ম্যানেজমেন্ট মেনু</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Admin</span>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-black text-white shadow-md shadow-stone-900/10'
                          : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-stone-200 text-stone-800'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Admin Footer Info & Sidebar Logout */}
            <div className="space-y-2">
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 font-medium">WhatsApp হটলাইন:</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800">{WHATSAPP_PHONE_DISPLAY}</span>
                </div>
                <div className="text-[11px] text-stone-500">
                  <span>বর্তমান অফার: </span>
                  <strong className="text-stone-900">৫ পিস ৫০০৳</strong>
                </div>
              </div>

              <button
                onClick={async () => {
                  await logoutAdmin();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2.5 px-3 rounded-2xl border border-rose-200/90 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>এডমিন লগআউট (Logout)</span>
              </button>
            </div>
          </aside>

          {/* Mobile Overlay backdrop */}
          {isMobileSidebarOpen && (
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-30 lg:hidden"
            />
          )}

          {/* Main Dynamic Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FAF9F6] space-y-6">
            
            {/* ===================== TAB 1: OVERVIEW ===================== */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Greeting & Quick Action Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">
                      JM FASHION স্টোর পারফরম্যান্স সামারি
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      সর্বশেষ রিয়েল-টাইম কাস্টমার অর্ডার, রেভিনিউ ও ভ্যারিয়েন্ট স্টক অ্যানালিটিক্স
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="bg-black hover:bg-stone-800 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>অর্ডার লিস্ট ({orders.length})</span>
                    </button>
                    <button
                      onClick={() => setShowAddColorModal(true)}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold px-3.5 py-2.5 rounded-2xl flex items-center space-x-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>নতুন কালার</span>
                    </button>
                  </div>
                </div>

                {/* 4 Executive KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  
                  {/* Total Revenue */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">মোট বিক্রয় (Revenue)</span>
                      <div className="w-8 h-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                      ৳{totalRevenue.toLocaleString()}
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      <span>{orders.length}টি মোট অর্ডারের হিসাব</span>
                    </div>
                  </div>

                  {/* Pending Orders */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">পেন্ডিং ডেলিভারি</span>
                      <div className="w-8 h-8 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-amber-700">
                      {pendingOrdersCount} টি
                    </div>
                    <div className="text-[11px] text-amber-800 font-medium">
                      <span>কনফার্মেশন অপেক্ষমান</span>
                    </div>
                  </div>

                  {/* Confirmed / Shipped */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">প্রসেসিং ও ডেলিভার্ড</span>
                      <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-blue-900">
                      {confirmedOrdersCount + shippedOrdersCount + deliveredOrdersCount} টি
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium">
                      <span>{deliveredOrdersCount}টি ডেলিভারি সম্পন্ন</span>
                    </div>
                  </div>

                  {/* Active Color Variants */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">সক্রিয় কালার স্টক</span>
                      <div className="w-8 h-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-rose-900">
                      {product.colors.length} টি কালার
                    </div>
                    <div className="text-[11px] text-rose-700 font-medium">
                      <span>মোট {totalStockCount} পিস ইন-স্টক</span>
                    </div>
                  </div>

                </div>

                {/* Status Breakdown & Pricing Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  
                  {/* Status Progress Bar Widget */}
                  <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-rose-600" />
                        <span>অর্ডার স্ট্যাটাস পাইপলাইন</span>
                      </h4>
                      <span className="text-xs text-stone-500">মোট {orders.length}টি অর্ডার</span>
                    </div>

                    {orders.length > 0 ? (
                      <div className="space-y-3">
                        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                          <div style={{ width: `${(pendingOrdersCount / orders.length) * 100}%` }} className="bg-amber-400 h-full" title="Pending" />
                          <div style={{ width: `${(confirmedOrdersCount / orders.length) * 100}%` }} className="bg-blue-400 h-full" title="Confirmed" />
                          <div style={{ width: `${(shippedOrdersCount / orders.length) * 100}%` }} className="bg-indigo-500 h-full" title="Shipped" />
                          <div style={{ width: `${(deliveredOrdersCount / orders.length) * 100}%` }} className="bg-emerald-500 h-full" title="Delivered" />
                          <div style={{ width: `${(cancelledOrdersCount / orders.length) * 100}%` }} className="bg-rose-400 h-full" title="Cancelled" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="text-stone-600">পেন্ডিং: <strong className="text-stone-900">{pendingOrdersCount}</strong></span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                            <span className="text-stone-600">কনফার্মড: <strong className="text-stone-900">{confirmedOrdersCount}</strong></span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            <span className="text-stone-600">শিপড: <strong className="text-stone-900">{shippedOrdersCount}</strong></span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-stone-600">ডেলিভার্ড: <strong className="text-stone-900">{deliveredOrdersCount}</strong></span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                            <span className="text-stone-600">বাতিল: <strong className="text-stone-900">{cancelledOrdersCount}</strong></span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 text-center py-4">এখনও কোনো অর্ডার রেকর্ড করা হয়নি।</p>
                    )}
                  </div>

                  {/* Active Pricing Card */}
                  <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-rose-600" />
                        <span>অ্যাক্টিভ অফার প্রাইসিং</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab('pricing')}
                        className="text-xs text-rose-600 hover:underline font-bold"
                      >
                        এডিট
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-stone-50 p-2.5 rounded-xl flex items-center justify-between border border-stone-200">
                        <span className="text-stone-600">১ পিস রেগুলার:</span>
                        <span className="font-bold text-stone-900 font-serif">৳{product.basePrice || 120}</span>
                      </div>
                      <div className="bg-rose-50 p-2.5 rounded-xl flex items-center justify-between border border-rose-200 text-rose-950">
                        <div>
                          <span className="font-bold block">৫ পিস বান্ডেল অফার:</span>
                          <span className="text-[10px] text-rose-700">১০০৳ সেভ অফার</span>
                        </div>
                        <span className="text-base font-bold font-serif text-rose-700">৳{product.bundlePrice || 500}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Recent Orders Preview List */}
                <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-stone-900">
                        সর্বশেষ ৫টি কাস্টমার অর্ডার
                      </h4>
                      <p className="text-xs text-stone-500">দ্রুত স্ট্যাটাস পরিবর্তন ও কাস্টমার যোগাযোগ</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-stone-900 hover:underline flex items-center gap-1"
                    >
                      <span>সকল অর্ডার ({orders.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-xs text-stone-500 bg-stone-50 rounded-2xl">
                      এখনও কোনো অর্ডার আসেনি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-stone-800">
                        <thead className="bg-stone-50 text-stone-700 uppercase text-[10px] font-bold border-b border-stone-200">
                          <tr>
                            <th className="px-3 py-2.5">অর্ডার ID</th>
                            <th className="px-3 py-2.5">কাস্টমার</th>
                            <th className="px-3 py-2.5">কালার & পরিমাণ</th>
                            <th className="px-3 py-2.5">মোট মূল্য</th>
                            <th className="px-3 py-2.5">স্ট্যাটাস</th>
                            <th className="px-3 py-2.5 text-right">যোগাযোগ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {orders.slice(0, 5).map((ord) => {
                            const item = ord.items[0];
                            return (
                              <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                                <td className="px-3 py-2.5 font-mono font-bold text-stone-900">
                                  #{ord.orderNumber}
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="font-bold block text-stone-900">{ord.customer.name}</span>
                                  <span className="text-[11px] text-stone-500 font-mono">{ord.customer.phone}</span>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="font-bold block text-stone-900 leading-tight">
                                    {item?.productName || 'কালেকশন'}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-rose-700 font-bold text-[11px]">{item?.colorNameBn}</span>
                                    <span className="text-stone-400 text-[10px]">({item?.quantity} পিস × ৳{item?.unitPrice || (item?.totalPrice && item?.quantity ? Math.round(item.totalPrice / item.quantity) : 120)})</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 font-serif font-bold text-stone-900">
                                  ৳{ord.totalAmount.toLocaleString()}
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    ord.status === 'confirmed' ? 'bg-amber-100 text-amber-800' :
                                    ord.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                    'bg-stone-100 text-stone-800'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <a
                                    href={createCustomerWhatsAppUrl(ord)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg text-[11px] font-semibold border border-emerald-200"
                                  >
                                    <MessageCircle className="w-3 h-3 fill-[#25D366] text-transparent" />
                                    <span>WhatsApp</span>
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ===================== TAB: PRODUCTS MANAGEMENT ===================== */}
            {activeTab === 'products' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                      <span>৩টি কালেকশন ও প্রডাক্ট ক্যাটালগ</span>
                      <span className="bg-pink-100 text-pink-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-pink-200">
                        {products.length}টি প্রডাক্ট
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      সবগুলো প্রডাক্টের নাম, দাম, ছবি, দৃশ্যমানতা ও কালার ভ্যারিয়েন্ট নিয়ন্ত্রণ করুন
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন প্রডাক্ট যুক্ত করুন</span>
                  </button>
                </div>

                {/* Products List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => {
                    const mainImg = p.colors?.find(c => c.images && c.images.length > 0)?.images[0]?.url || p.heroBanners?.[0]?.imageUrl || '';
                    const isSelected = p.id === adminSelectedProductId;
                    const isVisible = p.isVisible !== false;

                    return (
                      <div
                        key={p.id}
                        className={`bg-white rounded-3xl border p-4 shadow-xs space-y-3 flex flex-col justify-between transition-all ${
                          isSelected ? 'border-pink-500 ring-2 ring-pink-300' : 'border-stone-200/80'
                        }`}
                      >
                        <div>
                          {/* Product Header */}
                          <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-16 h-20 rounded-xl overflow-hidden bg-pink-50/50 border border-pink-100 shrink-0 p-1 flex items-center justify-center">
                                <img
                                  src={mainImg}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full inline-block mb-1">
                                  {p.category || 'কালেকশন'}
                                </span>
                                <h4 className="font-bold text-sm text-stone-900 leading-snug">
                                  {p.nameBn}
                                </h4>
                                <span className="text-[11px] text-stone-500 block truncate">
                                  {p.name}
                                </span>
                              </div>
                            </div>

                            {/* Visibility Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                updateProduct(p.id, { isVisible: !isVisible });
                                showToast(`"${p.nameBn}" এর দৃশ্যমানতা ${!isVisible ? 'চালু' : 'লুকানো'} করা হয়েছে!`);
                              }}
                              className={`text-[11px] font-bold px-2 py-1 rounded-xl transition-all border cursor-pointer shrink-0 ${
                                isVisible
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                              }`}
                              title="ওয়েবসাইটে প্রডাক্ট দৃশ্যমানতা চালু বা বন্ধ করুন"
                            >
                              {isVisible ? '👀 লাইভ' : '🙈 লুকানো'}
                            </button>
                          </div>

                          {/* Price & Variants Summary */}
                          <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                            <div className="p-2 rounded-xl bg-pink-50/60 border border-pink-100 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-pink-800 block">১ পিস মূল্য</span>
                                <span className="font-serif font-bold text-pink-600 text-sm">৳{p.basePrice || 120}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newPrice = prompt(`"${p.nameBn}" এর নতুন ১ পিস মূল্য (৳):`, String(p.basePrice || 120));
                                  if (newPrice !== null && !isNaN(Number(newPrice)) && Number(newPrice) > 0) {
                                    updateProductInfo({ basePrice: Number(newPrice) }, p.id);
                                    showToast(`"${p.nameBn}" এর মূল্য ৳${newPrice} আপডেট করা হয়েছে!`);
                                  }
                                }}
                                className="text-[10px] bg-white hover:bg-pink-100 text-pink-700 px-2 py-0.5 rounded-lg border border-pink-200 font-bold transition-all cursor-pointer shadow-2xs"
                                title="দ্রুত ১ পিস মূল্য পরিবর্তন করুন"
                              >
                                এডিট
                              </button>
                            </div>
                            <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-rose-800 block">৫ পিস অফার</span>
                                <span className="font-serif font-bold text-rose-600 text-sm">৳{p.bundlePrice || 500}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newBundle = prompt(`"${p.nameBn}" এর নতুন ৫ পিস বান্ডেল মূল্য (৳):`, String(p.bundlePrice || 500));
                                  if (newBundle !== null && !isNaN(Number(newBundle)) && Number(newBundle) > 0) {
                                    updateProductInfo({ bundlePrice: Number(newBundle) }, p.id);
                                    showToast(`"${p.nameBn}" এর বান্ডেল মূল্য ৳${newBundle} আপডেট করা হয়েছে!`);
                                  }
                                }}
                                className="text-[10px] bg-white hover:bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200 font-bold transition-all cursor-pointer shadow-2xs"
                                title="দ্রুত বান্ডেল মূল্য পরিবর্তন করুন"
                              >
                                এডিট
                              </button>
                            </div>
                          </div>

                          {/* Color dots preview */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                            <span className="text-[11px] text-stone-500 font-medium whitespace-nowrap">
                              কালার ({p.colors.length}):
                            </span>
                            <div className="flex items-center gap-1">
                              {p.colors.slice(0, 6).map((c) => (
                                <span
                                  key={c.id}
                                  title={c.nameBn}
                                  className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs shrink-0"
                                  style={{ backgroundColor: c.code }}
                                />
                              ))}
                              {p.colors.length > 6 && (
                                <span className="text-[10px] text-stone-500 font-bold">
                                  +{p.colors.length - 6}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-stone-100 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              setAdminSelectedProductId(p.id);
                              setActiveTab('colors');
                            }}
                            className="py-2 px-1 text-center bg-stone-100 hover:bg-pink-100 hover:text-pink-800 text-stone-700 rounded-xl transition-all cursor-pointer text-[11px]"
                          >
                            কালার ও ছবি
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAdminSelectedProductId(p.id);
                              setActiveTab('pricing');
                            }}
                            className="py-2 px-1 text-center bg-stone-100 hover:bg-pink-100 hover:text-pink-800 text-stone-700 rounded-xl transition-all cursor-pointer text-[11px]"
                          >
                            প্রাইস এডিট
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAdminSelectedProductId(p.id);
                              setActiveTab('product');
                            }}
                            className="py-2 px-1 text-center bg-black hover:bg-stone-800 text-white rounded-xl transition-all cursor-pointer text-[11px]"
                          >
                            বিবরণ এডিট
                          </button>
                        </div>

                        {products.length > 1 && (
                          <div className="pt-2 text-right">
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="text-[11px] text-stone-400 hover:text-rose-600 font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>প্রডাক্ট মুছে ফেলুন</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===================== TAB: HERO BANNER MANAGEMENT ===================== */}
            {activeTab === 'hero_banner' && (
              <div className="animate-fadeIn">
                <HeroBannerManagement onShowToast={showToast} />
              </div>
            )}

            {/* ===================== TAB 2: ORDERS MANAGEMENT ===================== */}
            {activeTab === 'orders' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    
                    {/* Search Field */}
                    <div className="relative w-full sm:w-80">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="অর্ডার ID, নাম, ফোন বা ঠিকানা লিখুন..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 pl-10 text-xs text-stone-900 focus:outline-none focus:border-black"
                      />
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* CSV Export & Actions */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleExportCSV}
                        className="bg-black hover:bg-stone-800 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>CSV এক্সপোর্ট ({filteredOrders.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Status Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {[
                      { id: 'all', label: 'সব অর্ডার', count: orders.length },
                      { id: 'pending', label: 'Pending', count: pendingOrdersCount, color: 'text-amber-700 bg-amber-50' },
                      { id: 'confirmed', label: 'Confirmed', count: confirmedOrdersCount, color: 'text-blue-700 bg-blue-50' },
                      { id: 'shipped', label: 'Shipped', count: shippedOrdersCount, color: 'text-indigo-700 bg-indigo-50' },
                      { id: 'delivered', label: 'Delivered', count: deliveredOrdersCount, color: 'text-emerald-700 bg-emerald-50' },
                      { id: 'cancelled', label: 'Cancelled', count: cancelledOrdersCount, color: 'text-rose-700 bg-rose-50' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedOrderFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                          selectedOrderFilter === f.id
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          selectedOrderFilter === f.id ? 'bg-white/20 text-white' : 'bg-white text-stone-800'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders Content View */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-2">
                    <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
                    <h5 className="text-sm font-bold text-stone-700">কোনো অর্ডার মেলেনি</h5>
                    <p className="text-xs text-stone-500">আপনার ফিল্টার বা সার্চ কিওয়ার্ড পরিবর্তন করে দেখুন।</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    
                    {/* Desktop Table View (Hidden on mobile) */}
                    <div className="hidden lg:block bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
                      <table className="w-full text-xs text-left text-stone-800">
                        <thead className="bg-stone-50 text-stone-700 uppercase text-[10px] font-bold border-b border-stone-200">
                          <tr>
                            <th className="px-4 py-3.5">অর্ডার ID & তারিখ</th>
                            <th className="px-4 py-3.5">কাস্টমার তথ্য</th>
                            <th className="px-4 py-3.5">পণ্য, কালার & সাইজ</th>
                            <th className="px-4 py-3.5">পরিমাণ, একক মূল্য & বিল</th>
                            <th className="px-4 py-3.5">স্ট্যাটাস চেঞ্জার</th>
                            <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredOrders.map((ord) => {
                            const item = ord.items[0];
                            return (
                              <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                                <td className="px-4 py-3.5">
                                  <span className="font-mono font-bold text-stone-900 block text-sm">#{ord.orderNumber}</span>
                                  <span className="text-[10px] text-stone-400">
                                    {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span className="font-bold text-stone-900 block text-sm">{ord.customer.name}</span>
                                  <div className="flex items-center space-x-2 text-stone-600 text-xs mt-0.5">
                                    <a href={`tel:${ord.customer.phone}`} className="font-mono text-stone-900 font-bold hover:underline flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-rose-600" />
                                      {ord.customer.phone}
                                    </a>
                                  </div>
                                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                    {ord.customer.address}
                                  </p>
                                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                                    {ord.customer.deliveryZone === 'inside_dhaka' ? '📍 ঢাকা শহর (৳' + ord.deliveryFee + ')' : '📍 ঢাকার বাইরে (৳' + ord.deliveryFee + ')'}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <div className="space-y-1">
                                    <span className="font-bold text-stone-900 block text-xs">
                                      {item?.productName || 'কালেকশন'}
                                    </span>
                                    <div className="flex items-center space-x-1.5">
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0 shadow-xs"
                                        style={{ backgroundColor: item?.colorCode || '#800' }}
                                      />
                                      <span className="font-bold text-rose-700 text-[11px]">{item?.colorNameBn}</span>
                                      <span className="text-[10px] text-stone-400">({item?.size})</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3.5">
                                  <div className="text-sm font-serif font-bold text-stone-900">
                                    ৳{ord.totalAmount.toLocaleString()}
                                  </div>
                                  <div className="text-[11px] text-stone-600">
                                    <span>{item?.quantity} পিস (১ পিস: ৳{item?.unitPrice || (item?.totalPrice && item?.quantity ? Math.round(item.totalPrice / item.quantity) : 120)})</span>
                                    {item?.appliedBundle && (
                                      <span className="ml-1 text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                                        🔥 বান্ডেল
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-stone-500 font-medium">ডেলিভারি: ৳{ord.deliveryFee}</span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <select
                                    value={ord.status}
                                    onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                                      ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                      ord.status === 'shipped' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                                      ord.status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                      ord.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                                      'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                  >
                                    <option value="pending">🟡 Pending</option>
                                    <option value="confirmed">🔵 Confirmed</option>
                                    <option value="shipped">🟣 Shipped</option>
                                    <option value="delivered">🟢 Delivered</option>
                                    <option value="cancelled">🔴 Cancelled</option>
                                  </select>
                                </td>

                                <td className="px-4 py-3.5 text-right space-x-1">
                                  {/* WhatsApp Customer */}
                                  <a
                                    href={createCustomerWhatsAppUrl(ord)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Chat with customer on WhatsApp"
                                    className="inline-flex p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                                  >
                                    <MessageCircle className="w-4 h-4 fill-[#25D366] text-transparent" />
                                  </a>

                                  {/* View Details */}
                                  <button
                                    onClick={() => setSelectedOrderForView(ord)}
                                    title="View Full Details"
                                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>

                                  {/* Delete Order */}
                                  <button
                                    onClick={() => setOrderToDelete(ord)}
                                    title="Delete Order"
                                    className="p-2 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-400 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View (Optimized for Phones & Tablets) */}
                    <div className="lg:hidden space-y-3">
                      {filteredOrders.map((ord) => {
                        const item = ord.items[0];
                        return (
                          <div key={ord.id} className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
                            
                            {/* Card Header */}
                            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                              <div>
                                <span className="font-mono font-bold text-stone-900 text-sm">#{ord.orderNumber}</span>
                                <span className="text-[10px] text-stone-400 block">
                                  {new Date(ord.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Status Badge & Select */}
                              <select
                                value={ord.status}
                                onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none ${
                                  ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                  ord.status === 'shipped' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                                  ord.status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                  ord.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                                  'bg-amber-50 text-amber-800 border-amber-300'
                                }`}
                              >
                                <option value="pending">🟡 Pending</option>
                                <option value="confirmed">🔵 Confirmed</option>
                                <option value="shipped">🟣 Shipped</option>
                                <option value="delivered">🟢 Delivered</option>
                                <option value="cancelled">🔴 Cancelled</option>
                              </select>
                            </div>

                            {/* Customer & Product Row */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] text-stone-400 block uppercase font-bold">কাস্টমার</span>
                                <span className="font-bold text-stone-900 block truncate">{ord.customer.name}</span>
                                <a href={`tel:${ord.customer.phone}`} className="font-mono text-rose-700 font-bold text-xs flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />
                                  {ord.customer.phone}
                                </a>
                                <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-700">
                                  {ord.customer.deliveryZone === 'inside_dhaka' ? '📍 ঢাকা' : '📍 ঢাকার বাইরে'}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] text-stone-400 block uppercase font-bold">পণ্য & কালার</span>
                                <span className="font-bold text-stone-900 text-xs block truncate mt-0.5">
                                  {item?.productName || 'কালেকশন'}
                                </span>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  <span className="w-3 h-3 rounded-full border border-stone-300 shrink-0" style={{ backgroundColor: item?.colorCode || '#800' }} />
                                  <span className="font-bold text-rose-700 text-[11px] truncate">{item?.colorNameBn}</span>
                                </div>
                                <span className="text-[11px] text-stone-600 block mt-0.5">
                                  {item?.quantity} পিস × ৳{item?.unitPrice || (item?.totalPrice && item?.quantity ? Math.round(item.totalPrice / item.quantity) : 120)} {item?.appliedBundle ? '(🔥 অফার)' : ''}
                                </span>
                                <span className="text-[10px] text-stone-400 block">
                                  ডেলিভারি: ৳{ord.deliveryFee}
                                </span>
                              </div>
                            </div>

                            {/* Total & Action Buttons */}
                            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                              <div>
                                <span className="text-[10px] text-stone-400 block">সর্বমোট বিল:</span>
                                <span className="text-base font-serif font-bold text-stone-900">৳{ord.totalAmount.toLocaleString()}</span>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                <a
                                  href={createCustomerWhatsAppUrl(ord)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  title="WhatsApp Chat"
                                >
                                  <MessageCircle className="w-4 h-4 fill-[#25D366] text-transparent" />
                                </a>

                                <button
                                  onClick={() => setSelectedOrderForView(ord)}
                                  className="p-2 rounded-xl bg-stone-100 text-stone-700"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => setOrderToDelete(ord)}
                                  className="p-2 rounded-xl bg-stone-100 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ===================== TAB 3: COLORS & IMAGES ===================== */}
            {activeTab === 'colors' && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Product Selector for Multi-Product */}
                <div className="bg-[#FFF5F7] border border-pink-200 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-pink-900 uppercase tracking-wider">বর্তমানে এডিট হচ্ছে:</span>
                    <span className="text-xs font-bold text-stone-900 bg-white px-3 py-1 rounded-xl border border-pink-200 shadow-2xs flex items-center gap-1.5">
                      <span>🌸</span>
                      <span>{currentManagedProduct.nameBn || currentManagedProduct.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-[11px] text-stone-500 whitespace-nowrap">অন্য প্রডাক্ট সিলেক্ট করুন:</span>
                    {products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAdminSelectedProductId(p.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          p.id === currentManagedProduct.id
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                            : 'bg-white hover:bg-pink-100 text-stone-700 border border-pink-200'
                        }`}
                      >
                        {p.nameBn || p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                      <span>কালার ভ্যারিয়েন্ট ও ফটো গ্যালারি কন্ট্রোল</span>
                      <span className="bg-pink-50 text-pink-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-pink-200">
                        {currentManagedProduct.colors.length}টি কালার
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      "{currentManagedProduct.nameBn}" এর প্রতিটি কালারের নাম, হেক্স কোড, স্টক এবং ছবি যুক্ত করুন
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddColorModal(true)}
                    className="bg-black hover:bg-stone-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন কালার ভ্যারিয়েন্ট</span>
                  </button>
                </div>

                {/* Color Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentManagedProduct.colors.map((color) => (
                    <div key={color.id} className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs space-y-3 flex flex-col justify-between">
                      
                      {/* Color Header */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-stone-300 shadow-xs shrink-0"
                            style={{ backgroundColor: color.code }}
                          />
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-stone-900">{color.nameBn}</h4>
                            <span className="text-[11px] text-stone-500">{color.name} ({color.code})</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              const newStock = prompt(`"${color.nameBn}" কালারের নতুন স্টক সংখ্যা লিখুন:`, String(color.stock));
                              if (newStock !== null && !isNaN(Number(newStock))) {
                                updateColorVariant(color.id, { stock: Number(newStock) }, currentManagedProduct.id);
                                showToast(`স্টক আপডেট হয়েছে: ${newStock} পিস`);
                              }
                            }}
                            className="text-[11px] bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-xl text-stone-800 font-bold border border-stone-200 cursor-pointer"
                          >
                            স্টক: {color.stock}
                          </button>

                          <button
                            onClick={() => setColorVariantToDelete(color)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Color Variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Color Photos Preview & Add Button */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-500 font-medium">ছবি ({color.images.length}টি):</span>
                          <button
                            onClick={() => setSelectedColorForImg(color)}
                            className="text-pink-700 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>ছবি যোগ করুন</span>
                          </button>
                        </div>

                        {color.images.length === 0 ? (
                          <div className="p-3 text-center text-[11px] text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                            কোনো ছবি যুক্ত করা নেই
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {color.images.map((img) => (
                              <div key={img.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-stone-200 group bg-stone-50 shadow-2xs">
                                <img
                                  src={img.url}
                                  alt={img.alt}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain p-1 bg-white"
                                />

                                {/* Main Photo Badge */}
                                {img.isMain && (
                                  <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-xs">
                                    ★ Main
                                  </span>
                                )}

                                {/* Delete Image Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageToDelete({ colorId: color.id, colorNameBn: color.nameBn, image: img });
                                  }}
                                  className="absolute top-1 right-1 bg-white/95 hover:bg-rose-50 text-stone-500 hover:text-rose-600 p-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                                  title="ছবি ডিলিট করুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ===================== TAB 4: PRICING & BUNDLE OFFERS ===================== */}
            {activeTab === 'pricing' && (
              <form onSubmit={handleSaveProductMain} className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
                
                {/* Product Selector for Multi-Product */}
                <div className="bg-[#FFF5F7] border border-pink-200 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-pink-900 uppercase tracking-wider">বর্তমানে এডিট হচ্ছে:</span>
                    <span className="text-xs font-bold text-stone-900 bg-white px-3 py-1 rounded-xl border border-pink-200 shadow-2xs flex items-center gap-1.5">
                      <span>🌸</span>
                      <span>{currentManagedProduct.nameBn || currentManagedProduct.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-[11px] text-stone-500 whitespace-nowrap">অন্য প্রডাক্ট সিলেক্ট করুন:</span>
                    {products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAdminSelectedProductId(p.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          p.id === currentManagedProduct.id
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                            : 'bg-white hover:bg-pink-100 text-stone-700 border border-pink-200'
                        }`}
                      >
                        {p.nameBn || p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
                  <div className="border-b border-stone-100 pb-4">
                    <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-pink-600" />
                      <span>"{currentManagedProduct.nameBn}" এর প্রাইসিং ও অফার</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      ১ পিস ও ৫ পিস বান্ডেল অফারের সঠিক মূল্য ও ছাড় নির্ধারণ করুন
                    </p>
                  </div>

                  {/* Single Piece Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                      <label className="text-xs text-stone-700 font-bold block">
                        ১ পিস অফার মূল্য (৳ BDT)*
                      </label>
                      <input
                        type="number"
                        required
                        value={basePrice}
                        onChange={(e) => setBasePrice(Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-black"
                      />
                      <span className="text-[11px] text-stone-500 block">বর্তমান স্ট্যান্ডার্ড: ১২০৳</span>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                      <label className="text-xs text-stone-700 font-bold block">
                        ১ পিস রেগুলার মূল্য (কাটা দাগ) (৳)*
                      </label>
                      <input
                        type="number"
                        required
                        value={baseRegularPrice}
                        onChange={(e) => setBaseRegularPrice(Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-black"
                      />
                      <span className="text-[11px] text-stone-500 block">বর্তমান রেগুলার: ১৬০৳</span>
                    </div>
                  </div>

                  {/* Bundle Settings Card */}
                  <div className="p-4 sm:p-5 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-rose-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-rose-600" />
                        <span>🔥 ৫ পিস স্পেশাল বান্ডেল অফার</span>
                      </h4>
                      <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Best Deal
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-stone-700 block mb-1 font-medium">বান্ডেল পরিমাণ (পিস):</label>
                        <input
                          type="number"
                          required
                          value={bundleQuantity}
                          onChange={(e) => setBundleQuantity(Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-black font-mono font-bold"
                        />
                        <span className="text-[10px] text-stone-500 mt-0.5 block">যেমন: 5</span>
                      </div>

                      <div>
                        <label className="text-xs text-stone-700 block mb-1 font-medium">বান্ডেল প্যাকেজ মূল্য (৳):</label>
                        <input
                          type="number"
                          required
                          value={bundlePrice}
                          onChange={(e) => setBundlePrice(Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-black font-mono font-bold"
                        />
                        <span className="text-[10px] text-stone-500 mt-0.5 block">যেমন: 500</span>
                      </div>

                      <div>
                        <label className="text-xs text-stone-700 block mb-1 font-medium">অফার ব্যাজ টেক্সট:</label>
                        <input
                          type="text"
                          value={bundleOfferBadgeBn}
                          onChange={(e) => setBundleOfferBadgeBn(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-black"
                        />
                        <span className="text-[10px] text-stone-500 mt-0.5 block">যেমন: 🔥 Best Deal</span>
                      </div>
                    </div>

                    {/* Calculated Savings Box */}
                    <div className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between text-xs text-rose-950 font-medium">
                      <span>💡 অফার ক্যালকুলেশন প্রিভিউ:</span>
                      <span className="font-bold text-rose-700">
                        {bundleQuantity} পিস = ৳{bundlePrice} (কাস্টমার সেভ করবেন ৳{(bundleQuantity * basePrice) - bundlePrice})
                      </span>
                    </div>
                  </div>

                  {/* Delivery Charges Configuration */}
                  <div className="p-4 sm:p-5 bg-stone-50/80 border border-stone-200 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-200 pb-2.5">
                      <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-pink-600" />
                        <span>🚚 ডেলিভারি চার্জ কনফিগারেশন (Delivery Fees)</span>
                      </h4>
                      <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-2.5 py-0.5 rounded-full w-fit">
                        অর্ডার ফর্মে অটো ক্যালকুলেট হবে
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                        <label className="text-xs text-stone-800 font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>📍</span>
                            <span>ঢাকা শহরের ভেতরে (Inside Dhaka)</span>
                          </span>
                          <span className="text-[10px] text-stone-400 font-normal">ডিফল্ট: ১০০৳</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            value={deliveryFeeInsideDhaka}
                            onChange={(e) => setDeliveryFeeInsideDhaka(Number(e.target.value))}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 pl-8 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-black"
                          />
                          <span className="absolute left-3 top-2 font-bold text-stone-400 text-xs">৳</span>
                        </div>
                        <span className="text-[11px] text-stone-500 block">কাস্টমার ঢাকা সিলেক্ট করলে এই চার্জ যোগ হবে</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                        <label className="text-xs text-stone-800 font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>📍</span>
                            <span>ঢাকার বাইরে (Outside Dhaka)</span>
                          </span>
                          <span className="text-[10px] text-stone-400 font-normal">ডিফল্ট: ১৩০৳</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            value={deliveryFeeOutsideDhaka}
                            onChange={(e) => setDeliveryFeeOutsideDhaka(Number(e.target.value))}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 pl-8 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-black"
                          />
                          <span className="absolute left-3 top-2 font-bold text-stone-400 text-xs">৳</span>
                        </div>
                        <span className="text-[11px] text-stone-500 block">কাস্টমার ঢাকার বাইরে সিলেক্ট করলে এই চার্জ যোগ হবে</span>
                      </div>
                    </div>

                    {/* Delivery Calculation Preview Notice */}
                    <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                      <span className="text-base leading-none">💡</span>
                      <div className="space-y-0.5">
                        <p className="font-bold">উদাহরণ হিসেব:</p>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          • ১ পিস ({basePrice}৳) + ঢাকা ({deliveryFeeInsideDhaka}৳) = <strong>৳{basePrice + deliveryFeeInsideDhaka}</strong><br />
                          • ৫ পিস বান্ডেল ({bundlePrice}৳) + ঢাকার বাইরে ({deliveryFeeOutsideDhaka}৳) = <strong>৳{bundlePrice + deliveryFeeOutsideDhaka}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Offer Headline text */}
                  <div>
                    <label className="text-xs text-stone-700 block mb-1.5 font-medium">
                      হোমপেজ অফার ব্যানার টেক্সট (Offer Headline):
                    </label>
                    <input
                      type="text"
                      value={offerTextBn}
                      onChange={(e) => setOfferTextBn(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>প্রাইসিং ও ডেলিভারি সেটিংস সংরক্ষণ করুন</span>
                  </button>

                </div>

              </form>
            )}

            {/* ===================== TAB 5: PRODUCT & SEO INFO ===================== */}
            {activeTab === 'product' && (
              <form onSubmit={handleSaveProductMain} className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
                
                {/* Product Selector for Multi-Product */}
                <div className="bg-[#FFF5F7] border border-pink-200 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-pink-900 uppercase tracking-wider">বর্তমানে এডিট হচ্ছে:</span>
                    <span className="text-xs font-bold text-stone-900 bg-white px-3 py-1 rounded-xl border border-pink-200 shadow-2xs flex items-center gap-1.5">
                      <span>🌸</span>
                      <span>{currentManagedProduct.nameBn || currentManagedProduct.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-[11px] text-stone-500 whitespace-nowrap">অন্য প্রডাক্ট সিলেক্ট করুন:</span>
                    {products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAdminSelectedProductId(p.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          p.id === currentManagedProduct.id
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                            : 'bg-white hover:bg-pink-100 text-stone-700 border border-pink-200'
                        }`}
                      >
                        {p.nameBn || p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
                  <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-serif font-bold text-stone-900">
                        "{currentManagedProduct.nameBn}" এর বিবরণ ও সেটিংস
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        প্রডাক্টের শিরোনাম, ক্যাটাগরি, দৃশ্যমানতা ও বিবরণ পরিবর্তন করুন
                      </p>
                    </div>

                    {/* Visibility Switch */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-700">ওয়েবসাইটে প্রদর্শন:</span>
                      <button
                        type="button"
                        onClick={() => setProductIsVisible(!productIsVisible)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          productIsVisible
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-stone-100 text-stone-600 border-stone-300'
                        }`}
                      >
                        {productIsVisible ? '👀 প্রদর্শিত হচ্ছে' : '🙈 লুকানো'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="text-stone-700 block mb-1 font-medium">প্রডাক্ট নাম (বাংলা)*:</label>
                      <input
                        type="text"
                        required
                        value={productNameBn}
                        onChange={(e) => setProductNameBn(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-black font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-stone-700 block mb-1 font-medium">প্রডাক্ট নাম (English):</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-stone-700 block mb-1 font-medium">ক্যাটাগরি (Category):</label>
                      <input
                        type="text"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        placeholder="যেমন: blouse, petticoat"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-stone-700 block mb-1 font-medium">ট্যাগলাইন (Tagline):</label>
                    <input
                      type="text"
                      value={taglineBn}
                      onChange={(e) => setTaglineBn(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-stone-700 block mb-1 font-medium">বাংলা বিবরণ (Description):</label>
                    <textarea
                      rows={4}
                      value={descriptionBn}
                      onChange={(e) => setDescriptionBn(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-black hover:bg-stone-800 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center space-x-2 shadow-md cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>পরিবর্তন সেভ করুন</span>
                  </button>
                </div>

                {/* Danger Zone: Reset Product & Colors */}
                <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-200/80 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>প্রডাক্ট ও কালার ডাটা রিসেট (Reset Defaults)</span>
                      </h4>
                      <p className="text-xs text-rose-700/80 mt-1 max-w-lg leading-relaxed">
                        যদি ডেমো বা টেস্ট পরিবর্তনের পর প্রডাক্টের মূল নাম, অফার রেট, এবং কালার ভ্যারিয়েন্টগুলো প্রাথমিক ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান, তবে নিচের বাটনটি ব্যবহার করুন।
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between flex-wrap gap-3">
                    <span className="text-[11px] text-stone-500 font-medium">
                      ⚠️ দ্রষ্টব্য: এর মাধ্যমে কাস্টমারদের কোনো অর্ডার ডিলিট হবে না।
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowProductResetModal(true)}
                      className="bg-white hover:bg-rose-600 hover:text-white text-rose-700 font-bold border border-rose-300 px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ডিফল্ট প্রডাক্ট সেটিংসে রিসেট করুন</span>
                    </button>
                  </div>
                </div>

              </form>
            )}

          </main>

        </div>

      </motion.div>

      {/* ===================== TOAST NOTIFICATIONS ===================== */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] max-w-sm w-full animate-bounceIn pointer-events-auto">
          <div
            className={`p-4 rounded-2xl border shadow-xl flex items-center justify-between gap-3 text-xs font-bold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700'
                : 'bg-rose-950/90 text-rose-100 border-rose-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-stone-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ORDER DETAILS PREVIEW ===================== */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  অর্ডার বিস্তারিত #{selectedOrderForView.orderNumber}
                </h4>
                <span className="text-[11px] text-stone-400">
                  {new Date(selectedOrderForView.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">কাস্টমার ডেলিভারি তথ্য:</span>
                <p className="font-bold text-stone-900 text-sm">{selectedOrderForView.customer.name}</p>
                <p className="font-mono text-stone-800 font-bold">{selectedOrderForView.customer.phone}</p>
                {selectedOrderForView.customer.thana && (
                  <p className="text-stone-700 font-medium">থানা: {selectedOrderForView.customer.thana}</p>
                )}
                <p className="text-stone-600 mt-1">{selectedOrderForView.customer.address}</p>
                {selectedOrderForView.customer.preferredColors && (
                  <div className="mt-1 p-2 bg-pink-50 border border-pink-200 rounded-xl text-pink-950 font-medium text-xs">
                    <strong>পছন্দের কালারসমূহ:</strong> {selectedOrderForView.customer.preferredColors}
                  </div>
                )}
                <div className="mt-1.5 pt-1.5 border-t border-stone-200/80 flex items-center justify-between text-xs">
                  <span className="text-stone-500">ডেলিভারি লোকেশন:</span>
                  <span className="font-bold text-rose-700">
                    {selectedOrderForView.customer.deliveryZone === 'inside_dhaka'
                      ? `📍 ঢাকার মধ্যে (৳${selectedOrderForView.deliveryFee})`
                      : `📍 ঢাকার বাইরে (৳${selectedOrderForView.deliveryFee})`}
                  </span>
                </div>
                {selectedOrderForView.customer.note && (
                  <p className="text-rose-700 italic mt-1">নোট: {selectedOrderForView.customer.note}</p>
                )}
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">অর্ডারকৃত পণ্য:</span>
                {selectedOrderForView.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-stone-900 block">{item.productName}</span>
                      <span className="text-rose-700 font-medium block">কালার: {item.colorNameBn} (সাইজ: {item.size})</span>
                      {item.selectedColors && item.selectedColors.length > 1 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedColors.map((sc) => (
                            <span key={sc.colorId} className="inline-flex items-center gap-1 bg-white border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-stone-800">
                              <span className="w-2 h-2 rounded-full border border-stone-300 shrink-0" style={{ backgroundColor: sc.colorCode }} />
                              <span>{sc.colorNameBn}: {sc.quantity} পিস</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-stone-400 text-[10px] block mt-0.5">১ পিস মূল্য: ৳{item.unitPrice || (item.totalPrice && item.quantity ? Math.round(item.totalPrice / item.quantity) : 120)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold block">{item.quantity} পিস</span>
                      <span className="font-serif font-bold text-stone-900">৳{item.totalPrice}</span>
                      {item.appliedBundle && (
                        <span className="text-[10px] text-rose-600 font-bold block">🔥 অফার ছাড়</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1 border-t border-stone-100">
                <div className="flex justify-between text-stone-600">
                  <span>পণ্যের মূল্য:</span>
                  <span className="font-mono">৳{selectedOrderForView.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-mono">৳{selectedOrderForView.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-100">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="font-serif text-base">৳{selectedOrderForView.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <a
                href={createCustomerWhatsAppUrl(selectedOrderForView)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-[#25D366] text-transparent" />
                <span>WhatsApp-এ মেসেজ দিন</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  const ord = selectedOrderForView;
                  setSelectedOrderForView(null);
                  setOrderToDelete(ord);
                }}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                title="অর্ডার ডিলিট করুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="px-4 py-2.5 bg-stone-100 text-stone-800 text-xs font-bold rounded-2xl hover:bg-stone-200 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CONFIRMATION MODAL: ORDER DELETE ===================== */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-stone-900">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-serif font-bold text-lg text-stone-900">
                অর্ডার ডিলিট নিশ্চিতকরণ
              </h4>
              <p className="text-sm font-bold text-rose-600">
                "আপনি কি এই Order টি Delete করতে চান?"
              </p>
              <p className="text-xs text-stone-500 pt-1">
                অর্ডার <strong>#{orderToDelete.orderNumber}</strong> স্থায়ীভাবে সার্ভার ও ডাটাবেজ থেকে মুছে যাবে।
              </p>
            </div>

            {/* Order summary badge */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">কাস্টমার:</span>
                <span className="font-bold text-stone-900">{orderToDelete.customer.name} ({orderToDelete.customer.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">মোট মূল্য:</span>
                <span className="font-bold text-stone-900">৳{orderToDelete.totalAmount} ({orderToDelete.items[0]?.quantity} পিস)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ঠিকানা:</span>
                <span className="text-stone-700 truncate max-w-[200px]">{orderToDelete.customer.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={() => setOrderToDelete(null)}
                className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                না, বাতিল
              </button>
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={confirmDeleteOrder}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, মুছে ফেলুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CONFIRMATION MODAL: IMAGE DELETE ===================== */}
      {imageToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-stone-900">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-serif font-bold text-base text-stone-900">
                ছবি মুছে ফেলা
              </h4>
              <p className="text-sm font-bold text-rose-600">
                "আপনি কি এই ছবিটি মুছে ফেলতে চান?"
              </p>
              <p className="text-xs text-stone-500">
                কালার: <strong>{imageToDelete.colorNameBn}</strong>
              </p>
            </div>

            <div className="w-28 h-36 mx-auto rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100">
              <img
                src={imageToDelete.image.url}
                alt={imageToDelete.image.alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingImage}
                onClick={() => setImageToDelete(null)}
                className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isDeletingImage}
                onClick={confirmDeleteImage}
                className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeletingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>মুছছে...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>হ্যাঁ, ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CONFIRMATION MODAL: COLOR VARIANT DELETE ===================== */}
      {colorVariantToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-stone-900">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-serif font-bold text-base text-stone-900">
                কালার ভ্যারিয়েন্ট মুছে ফেলা
              </h4>
              <p className="text-sm font-bold text-rose-600">
                "আপনি কি এই কালার ভ্যারিয়েন্টটি মুছে ফেলতে চান?"
              </p>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-full border border-stone-300 shadow-xs shrink-0"
                style={{ backgroundColor: colorVariantToDelete.colorCode }}
              />
              <div className="text-xs">
                <span className="font-bold text-stone-900 block">{colorVariantToDelete.nameBn} ({colorVariantToDelete.name})</span>
                <span className="text-stone-500 block">স্টক: {colorVariantToDelete.stock} পিস | ছবি: {colorVariantToDelete.images.length}টি</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingColor}
                onClick={() => setColorVariantToDelete(null)}
                className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isDeletingColor}
                onClick={confirmDeleteColorVariant}
                className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeletingColor ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>মুছছে...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>হ্যাঁ, ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CONFIRMATION MODAL: PRODUCT RESET ===================== */}
      {showProductResetModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-stone-900">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-serif font-bold text-lg text-stone-900">
                প্রডাক্ট ডাটা রিসেট
              </h4>
              <p className="text-sm font-bold text-rose-600">
                "আপনি কি প্রডাক্ট ও কালার সেটিংস ডিফল্ট অবস্থায় রিসেট করতে চান?"
              </p>
              <p className="text-xs text-stone-600 pt-1 leading-relaxed">
                সতর্কতা: বর্তমান প্রডাক্ট নাম, মূল্য, ৫টি কালার ভ্যারিয়েন্ট এবং সব ছবি প্রাথমিক ডিফল্ট অবস্থায় ফিরে যাবে। তবে কাস্টমারদের কোনো অর্ডার মুছে যাবে না।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isResettingProduct}
                onClick={() => setShowProductResetModal(false)}
                className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isResettingProduct}
                onClick={confirmResetProduct}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isResettingProduct ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>রিসেট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>হ্যাঁ, রিসেট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD NEW COLOR ===================== */}
      {showAddColorModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddColorSubmit} className="bg-white rounded-3xl border border-stone-200 p-6 w-full max-w-md space-y-4 text-stone-900 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-sm font-bold text-stone-900 font-serif">নতুন কালার ভ্যারিয়েন্ট যোগ করুন</h4>
              <button
                type="button"
                onClick={() => setShowAddColorModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-700 block mb-1 font-medium">কালার নাম (বাংলা)*:</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ডার্ক অলিভ"
                  value={newColorNameBn}
                  onChange={(e) => setNewColorNameBn(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-stone-700 block mb-1 font-medium">কালার নাম (English)*:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dark Olive"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 block mb-1 font-medium">কালার হেক্স কোড (Hex):</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 text-stone-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-700 block mb-1 font-medium">স্টক পরিমাণ:</label>
                  <input
                    type="number"
                    value={newColorStock}
                    onChange={(e) => setNewColorStock(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-700 block mb-1 font-medium">প্রথম ছবি (আপলোড বা URL):</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-center px-3 py-2 bg-pink-50 border border-pink-200 rounded-xl text-pink-700 text-xs font-semibold cursor-pointer hover:bg-pink-100 transition-colors">
                    <Upload className="w-4 h-4 mr-1.5" />
                    {isUploadingImage ? 'আপলোড হচ্ছে...' : 'ছবি ফাইল সিলেক্ট/আপলোড করুন'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingImage}
                      onChange={(e) => handleFileUploadForInput(e, setNewColorImgUrl)}
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="অথবা লিঙ্ক দিন: https://..."
                    value={newColorImgUrl}
                    onChange={(e) => setNewColorImgUrl(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAddColorModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs hover:bg-stone-200 font-medium cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black hover:bg-stone-800 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                কালার যুক্ত করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================== MODAL: ADD IMAGE TO COLOR ===================== */}
      {selectedColorForImg && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddImageSubmit} className="bg-white rounded-3xl border border-stone-200 p-6 w-full max-w-md space-y-4 text-stone-900 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-sm font-bold text-stone-900 font-serif">
                "{selectedColorForImg.nameBn}" কালারে ছবি যুক্ত করুন
              </h4>
              <button
                type="button"
                onClick={() => setSelectedColorForImg(null)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-stone-700 block mb-1 font-medium">ছবি আপলোড বা Direct URL*:</label>
              <div className="space-y-2">
                <label className="flex items-center justify-center px-3 py-2.5 bg-pink-50 border border-pink-200 rounded-xl text-pink-700 text-xs font-semibold cursor-pointer hover:bg-pink-100 transition-colors">
                  <Upload className="w-4 h-4 mr-1.5" />
                  {isUploadingImage ? 'ফায়ারবেসে আপলোড হচ্ছে...' : 'ডিভাইস থেকে নতুন ছবি আপলোড করুন'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingImage}
                    onChange={(e) => handleFileUploadForInput(e, setNewImageUrl)}
                  />
                </label>
                <input
                  type="url"
                  required
                  placeholder="অথবা লিঙ্ক লিখুন: https://..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedColorForImg(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs hover:bg-stone-200 font-medium cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black hover:bg-stone-800 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                ছবি যুক্ত করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================== MODAL: ADD NEW PRODUCT ===================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewProduct}
            className="bg-white rounded-3xl border border-stone-200 p-6 w-full max-w-lg space-y-4 text-stone-900 shadow-2xl animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-stone-900 font-serif">
                  নতুন প্রডাক্ট যোগ করুন (Add Product)
                </h4>
                <p className="text-xs text-stone-500">
                  ৩টি কালেকশনের সাথে নতুন প্রডাক্ট যুক্ত করুন
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 block mb-1 font-medium">প্রডাক্ট নাম (বাংলা)*:</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সিল্ক ব্লাউজ কালেকশন"
                    value={newProdNameBn}
                    onChange={(e) => setNewProdNameBn(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-black font-bold"
                  />
                </div>
                <div>
                  <label className="text-stone-700 block mb-1 font-medium">প্রডাক্ট নাম (English):</label>
                  <input
                    type="text"
                    placeholder="e.g. Silk Blouse Collection"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-700 block mb-1 font-medium">ক্যাটাগরি:</label>
                  <input
                    type="text"
                    placeholder="blouse / petticoat"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-stone-700 block mb-1 font-medium">১ পিস মূল্য (৳):</label>
                  <input
                    type="number"
                    value={newProdBasePrice}
                    onChange={(e) => setNewProdBasePrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-stone-700 block mb-1 font-medium">৫ পিস অফার (৳):</label>
                  <input
                    type="number"
                    value={newProdBundlePrice}
                    onChange={(e) => setNewProdBundlePrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-2">
                <span className="font-bold text-stone-800 block">প্রাথমিক কালার ভ্যারিয়েন্ট:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-stone-500 block mb-1 text-[11px]">কালার নাম (বাংলা):</label>
                    <input
                      type="text"
                      value={newProdColorNameBn}
                      onChange={(e) => setNewProdColorNameBn(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 block mb-1 text-[11px]">কালার নাম (English):</label>
                    <input
                      type="text"
                      value={newProdColorName}
                      onChange={(e) => setNewProdColorName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 block mb-1 text-[11px]">কালার কোড:</label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="color"
                        value={newProdColorCode}
                        onChange={(e) => setNewProdColorCode(e.target.value)}
                        className="w-7 h-7 rounded-lg bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newProdColorCode}
                        onChange={(e) => setNewProdColorCode(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-1.5 py-1 text-stone-900 font-mono text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-stone-700 block mb-1 font-medium">প্রডাক্ট ছবি (আপলোড বা URL):</label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-center px-3 py-2 bg-pink-50 border border-pink-200 rounded-xl text-pink-700 text-xs font-semibold cursor-pointer hover:bg-pink-100 transition-colors">
                      <Upload className="w-4 h-4 mr-1.5" />
                      {isUploadingImage ? 'আপলোড হচ্ছে...' : 'ছবি ফাইল সিলেক্ট/আপলোড করুন'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={(e) => handleFileUploadForInput(e, setNewProdImageUrl)}
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs hover:bg-stone-200 font-medium cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isCreatingProduct}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isCreatingProduct ? 'তৈরি হচ্ছে...' : 'প্রডাক্ট তৈরি করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================== MODAL: DELETE PRODUCT CONFIRMATION ===================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-200 p-6 w-full max-w-md space-y-4 text-stone-900 shadow-2xl animate-scaleUp">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-serif text-stone-900">প্রডাক্ট মুছে ফেলা নিশ্চিত করুন</h4>
                <p className="text-xs text-stone-500">এই পরিবর্তনটি ফিরিয়ে নেওয়া যাবে না</p>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200/60">
              আপনি কি নিশ্চিত যে <strong className="text-rose-900">"{productToDelete.nameBn}"</strong> প্রডাক্টটি স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs hover:bg-stone-200 font-medium cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={isDeletingProduct}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeletingProduct ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
