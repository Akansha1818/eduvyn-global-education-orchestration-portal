import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    name: String,
    url: String,      
    uploadDate: String,
    size: String,
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
