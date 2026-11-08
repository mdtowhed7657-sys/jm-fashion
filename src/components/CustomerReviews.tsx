import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquarePlus, ThumbsUp, Filter } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CustomerReviews: React.FC = () => {
  const { reviews, addReview, product, selectedColorId, theme } = useStore();
  const [filterColor, setFilterColor] = useState<string>('all');
  const [showAddReview, setShowAddReview] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const activeColor = product.colors.find(c => c.id === selectedColorId) || product.colors[0];

  const filteredReviews = filterColor === 'all'
    ? reviews
    : reviews.filter(r => r.colorName.toLowerCase().includes(filterColor.toLowerCase()));

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      alert('অনুগ্রহ করে আপনার নাম ও মন্তব্য প্রদান করুন।');
      return;
    }

    addReview({
      customerName: name,
      rating,
      comment,
      colorName: activeColor.name,
      colorCode: activeColor.code
    });

    setName('');
    setComment('');
    setShowAddReview(false);
  };

  return (
    <section className="py-12 bg-stone-50/80 text-stone-900 border-b border-stone-200 theme-transition">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Overall Rating */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-2xl font-serif font-medium text-[#1A1A1A]">
              গ্রাহকদের সত্য মতামত ও রিভিউ
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              আমাদের সম্মানিত ক্রেতাদের থেকে প্রাপ্ত ভেরিফাইড ফিডব্যাক
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold font-serif text-stone-900">৪.৯</div>
              <div className="flex items-center text-amber-500 my-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-[11px] text-stone-500">১৮৪টি রিভিউ</div>
            </div>

            <button
              onClick={() => setShowAddReview(!showAddReview)}
              className="font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer theme-transition"
              style={{
                backgroundColor: theme.primary,
                color: theme.primaryContrastText
              }}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>রিভিউ লিখুন</span>
            </button>
          </div>
        </div>

        {/* Add Review Form Drawer/Modal */}
        {showAddReview && (
          <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-4 animate-fadeIn">
            <h4 className="text-sm font-bold text-[#1A1A1A]">
              আপনার মতামত শেয়ার করুন (নির্বাচিত কালার: {activeColor.nameBn})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-700 block mb-1 font-medium">আপনার নাম:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: নুসরাত জাহান"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1 font-medium">রেটিং প্রদান করুন:</label>
                <div className="flex items-center space-x-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 focus:outline-none cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${rating >= star ? 'fill-amber-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-900 ml-2">{rating}.0 Stars</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-stone-700 block mb-1 font-medium">আপনার রিভিউ লিখুন:</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="প্রডাক্টের ফ্যাব্রিকে, ফিটিং এবং ডেলিভারি নিয়ে আপনার অভিজ্ঞতা জানান..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddReview(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs hover:bg-stone-200 font-medium cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-xs cursor-pointer theme-transition"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryContrastText
                }}
              >
                সাবমিট করুন
              </button>
            </div>
          </form>
        )}

        {/* Filter Reviews by Color */}
        <div className="flex items-center space-x-2 text-xs overflow-x-auto pb-2 scrollbar-none">
          <span className="text-stone-600 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            কালার অনুযায়ী ফিল্টার:
          </span>
          <button
            onClick={() => setFilterColor('all')}
            className="px-3 py-1.5 rounded-lg border shrink-0 font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: filterColor === 'all' ? theme.primary : '#ffffff',
              color: filterColor === 'all' ? theme.primaryContrastText : '#44403c',
              borderColor: filterColor === 'all' ? theme.primary : '#e7e5e4'
            }}
          >
            সব কালার
          </button>
          {product.colors.slice(0, 8).map((col) => {
            const isMatch = filterColor.toLowerCase() === col.name.toLowerCase();
            return (
              <button
                key={col.id}
                onClick={() => setFilterColor(col.name)}
                className="px-3 py-1.5 rounded-lg border shrink-0 font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                style={{
                  backgroundColor: isMatch ? theme.primary : '#ffffff',
                  color: isMatch ? theme.primaryContrastText : '#44403c',
                  borderColor: isMatch ? theme.primary : '#e7e5e4'
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-stone-300" style={{ backgroundColor: col.code }} />
                <span>{col.nameBn}</span>
              </button>
            );
          })}
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-3 theme-transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">{rev.customerName}</h4>
                    {rev.verifiedBuyer && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">{rev.date}</div>
                </div>

                <div className="flex items-center text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Purchased Color Badge */}
              <div className="inline-flex items-center space-x-1.5 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200 text-[11px] text-stone-700">
                <span className="w-2.5 h-2.5 rounded-full border border-stone-300" style={{ backgroundColor: rev.colorCode }} />
                <span>ক্রয়কৃত কালার: <strong className="text-black">{rev.colorName}</strong></span>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                "{rev.comment}"
              </p>

              <div className="flex items-center justify-end text-[11px] text-stone-500 pt-1">
                <button className="hover:text-black flex items-center gap-1 font-medium cursor-pointer">
                  <ThumbsUp className="w-3 h-3" />
                  <span>সাহায্যকারী প্রতিক্রিয়া (24)</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
