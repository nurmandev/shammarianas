import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "../Context/UserProvider";
import { Helmet } from "react-helmet";
import PageTitle from "../Components/UI/PageTitle";
import DescriptionBox from "../Components/DescriptionBox";
import TagInput from "../Components/TagInput";
import FileUpload from "../Components/FileUpload";
import AssetTypeSelector from "../Components/AssetTypeSelector";
import AssetTypeFields from "../Components/AssetTypeFields";
import LoadingOverlay from "../Components/LoadingOverlay";
import "./Upload.css";

// Asset configuration
const ASSET_CONFIG = {
  models: {
    label: "3D Model",
    requiredFiles: ["model"],
    fileTypes: [".glb", ".gltf", ".obj", ".fbx", ".blend"],
    fields: ["vertices", "physicalSize", "lods"],
    checkboxes: ["textures", "materials", "uvMapping", "rigged", "animated", "vrArLowPoly"]
  },
  textures: {
    label: "Texture",
    maps: ["ambientOcclusion", "baseColor", "displacement", "normal", "roughness", "metallic", "bump", "idmap"],
    fileTypes: [".png", ".jpg", ".jpeg"]
  },
  sounds: {
    label: "Sound",
    requiredFiles: ["sound"],
    fileTypes: [".mp3", ".wav"]
  },
  scripts: {
    label: "Script",
    requiredFiles: ["script"],
    fileTypes: [".js", ".py", ".ts"]
  },
  images: {
    label: "Image",
    requiredFiles: ["images"],
    fileTypes: [".png", ".jpg", ".jpeg", ".webp"],
    isMulti: true
  },
  graphics: {
    label: "Graphics Template",
    requiredFiles: ["graphicsTemplate"],
    fileTypes: [".psd", ".ai", ".fig"]
  },
  mockups: {
    label: "Mockup",
    requiredFiles: ["mockupFile"],
    fileTypes: [".psd", ".xd"]
  },
  fonts: {
    label: "Font",
    requiredFiles: ["fontFile"],
    fileTypes: [".ttf", ".otf", ".woff"]
  },
  videos: {
    label: "Video",
    requiredFiles: ["video"],
    fileTypes: [".mp4", ".mov"]
  },
  "video-templates": {
    label: "Video Template",
    requiredFiles: ["videoTemplateFile"],
    fileTypes: [".aep", ".prproj"]
  },
  icons: {
    label: "Icons",
    requiredFiles: ["icons"],
    fileTypes: [".svg", ".png"],
    isMulti: true
  },
  hdris: {
    label: "HDRI",
    requiredFiles: ["hdri"],
    fileTypes: [".hdr", ".exr"]
  },
  other: {
    label: "Other",
    requiredFiles: ["other"],
    fileTypes: ["*"]
  }
};

// Filter options (simplified for example)
const FILTER_OPTIONS = {
  aiGenerated: ["Yes", "No", "Partially"],
  resolution: ["4K", "1080p", "720p", "Custom"],
  frameRate: ["24fps", "30fps", "60fps", "120fps"],
  properties: ["PBR", "Low-poly", "High-poly", "Animated"],
  applicationsSupported: ["Blender", "Maya", "Unity", "Unreal Engine"],
  orientation: ["Landscape", "Portrait", "Square"],
  licenseType: ["CC0", "Royalty Free", "Commercial"],
  surfaceMaterial: ["Metal", "Wood", "Fabric", "Plastic"],
  style: ["Realistic", "Cartoon", "Minimalist"],
  environmentType: ["Indoor", "Outdoor", "Studio"],
  lightingCondition: ["Daylight", "Night", "Studio"],
  scriptType: ["Utility", "Plugin", "Game Mechanic"],
  programmingLanguage: ["JavaScript", "Python", "C#"],
  framework: ["React", "Vue", "Angular"],
  integrationReady: ["Web", "Mobile", "Desktop"],
  colorSpace: ["sRGB", "Linear", "ACES"],
  objectType: ["Character", "Vehicle", "Environment"],
  fileFormat: [".fbx", ".obj", ".gltf"]
};

const CATEGORIES = [
  "Architecture", "Characters", "Vehicles", "Nature", 
  "Furniture", "Electronics", "Weapons", "Food"
];

const Upload = () => {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    title: "",
    thumbnail: null,
    description: "",
    type: "",
    category: "",
    tags: [],
    price: "",
    discount: "",
    date: new Date(),
    userId: currentUser?.uid || "",
    // Common metadata fields
    aiGenerated: "",
    resolution: "",
    frameRate: "",
    properties: [],
    applicationsSupported: [],
    orientation: "",
    licenseType: "",
    surfaceMaterial: "",
    style: "",
    environmentType: "",
    lightingCondition: "",
    scriptType: "",
    programmingLanguage: "",
    framework: "",
    integrationReady: [],
    colorSpace: "",
    objectType: "",
    fileFormat: "",
    // Asset type specific fields
    model: null,
    images: [],
    video: null,
    icons: [],
    script: null,
    hdri: null,
    graphicsTemplate: null,
    mockupFile: null,
    fontFile: null,
    videoTemplateFile: null,
    sound: null,
    other: null,
    ambientOcclusion: null,
    baseColor: null,
    displacement: null,
    normal: null,
    roughness: null,
    metallic: null,
    bump: null,
    idmap: null,
    vertices: "",
    physicalSize: "",
    lods: "",
    textures: false,
    materials: false,
    uvMapping: false,
    rigged: false,
    animated: false,
    vrArLowPoly: false
  });

  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: "",
    progress: 0
  });
  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    setFormData(prev => {
      let newValue;
      
      if (type === "checkbox") {
        newValue = checked;
      } else if (type === "file") {
        // Handle multi-file inputs
        if (name === "images" || name === "icons") {
          newValue = Array.from(files);
        } else {
          newValue = files[0] || null;
        }
      } else if (type === "select-multiple") {
        newValue = Array.from(e.target.selectedOptions, option => option.value);
      } else {
        newValue = value;
      }
      
      return { ...prev, [name]: newValue };
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Upload a file to Firebase Storage
  const uploadFile = async (file, path) => {
    if (!file) return null;
    
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytes(storageRef, file);
      
      // Track upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setLoadingState(prev => ({
            ...prev,
            progress,
            message: `Uploading ${file.name}...`
          }));
        }
      );
      
      await uploadTask;
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error(`Error uploading file: ${file.name}`, error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    const assetConfig = ASSET_CONFIG[formData.type] || {};
    
    // Basic validation
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.thumbnail) newErrors.thumbnail = "Thumbnail is required";
    if (!formData.type) newErrors.type = "Asset type is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.tags.length === 0) newErrors.tags = "At least one tag is required";
    
    // Asset-specific validation
    if (assetConfig.requiredFiles) {
      assetConfig.requiredFiles.forEach(field => {
        if (assetConfig.isMulti) {
          if (!formData[field] || formData[field].length === 0) {
            newErrors[field] = `${assetConfig.label} files are required`;
          }
        } else {
          if (!formData[field]) {
            newErrors[field] = `${assetConfig.label} file is required`;
          }
        }
      });
    }
    
    // Price validation
    if (formData.price && parseFloat(formData.price) < 0) {
      newErrors.price = "Price must be positive";
    }
    
    // Discount validation
    if (formData.discount) {
      const discount = parseFloat(formData.discount);
      if (discount < 0 || discount > 100) {
        newErrors.discount = "Discount must be between 0-100%";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    try {
      setLoadingState({
        isLoading: true,
        message: "Starting upload...",
        progress: 0
      });
      
      // Upload thumbnail
      setLoadingState({ ...loadingState, message: "Uploading thumbnail..." });
      const thumbnailUrl = await uploadFile(formData.thumbnail, "thumbnails");
      
      // Prepare base document data
      let docData = {
        title: formData.title,
        thumbnail: thumbnailUrl,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        tags: formData.tags,
        date: serverTimestamp(),
        userId: currentUser?.uid || "anonymous",
        price: formData.price ? parseFloat(formData.price) : 0,
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        // Metadata
        aiGenerated: formData.aiGenerated,
        resolution: formData.resolution,
        frameRate: formData.frameRate,
        properties: formData.properties,
        applicationsSupported: formData.applicationsSupported,
        orientation: formData.orientation,
        licenseType: formData.licenseType,
        surfaceMaterial: formData.surfaceMaterial,
        style: formData.style,
        environmentType: formData.environmentType,
        lightingCondition: formData.lightingCondition,
        scriptType: formData.scriptType,
        programmingLanguage: formData.programmingLanguage,
        framework: formData.framework,
        integrationReady: formData.integrationReady,
        colorSpace: formData.colorSpace,
        objectType: formData.objectType,
        fileFormat: formData.fileFormat,
        // 3D model specific
        vertices: formData.vertices,
        physicalSize: formData.physicalSize,
        lods: formData.lods,
        textures: formData.textures,
        materials: formData.materials,
        uvMapping: formData.uvMapping,
        rigged: formData.rigged,
        animated: formData.animated,
        vrArLowPoly: formData.vrArLowPoly
      };
      
      // Upload asset-specific files
      const assetConfig = ASSET_CONFIG[formData.type] || {};
      
      // Handle multi-file uploads
      if (assetConfig.isMulti) {
        const field = assetConfig.requiredFiles[0];
        if (formData[field] && formData[field].length > 0) {
          setLoadingState({ ...loadingState, message: `Uploading ${formData[field].length} files...` });
          const urls = await Promise.all(
            formData[field].map(file => uploadFile(file, `assets/${formData.type}`))
          );
          docData[field] = urls;
          docData[`${field}Names`] = formData[field].map(file => file.name);
        }
      } 
      // Handle single file uploads
      else if (assetConfig.requiredFiles) {
        for (const field of assetConfig.requiredFiles) {
          if (formData[field]) {
            setLoadingState({ ...loadingState, message: `Uploading ${field}...` });
            docData[field] = await uploadFile(formData[field], `assets/${formData.type}`);
            docData[`${field}Name`] = formData[field].name;
            docData[`${field}Size`] = formData[field].size;
          }
        }
      }
      
      // Handle texture maps
      if (formData.type === "textures" && assetConfig.maps) {
        const textureData = {};
        for (const map of assetConfig.maps) {
          if (formData[map]) {
            setLoadingState({ ...loadingState, message: `Uploading ${map}...` });
            textureData[map] = await uploadFile(formData[map], `assets/textures`);
            textureData[`${map}Name`] = formData[map].name;
          }
        }
        docData = { ...docData, ...textureData };
      }
      
      // Save to Firestore
      setLoadingState({ ...loadingState, message: "Saving to database..." });
      await addDoc(collection(db, "Assets"), docData);
      
      // Success
      setLoadingState({
        isLoading: false,
        message: "Upload successful!",
        progress: 100
      });
      
      // Reset form after successful upload
      setTimeout(() => {
        setFormData({
          ...formData,
          title: "",
          thumbnail: null,
          description: "",
          tags: [],
          price: "",
          discount: "",
          // Reset files
          model: null,
          images: [],
          video: null,
          icons: [],
          script: null,
          hdri: null,
          graphicsTemplate: null,
          mockupFile: null,
          fontFile: null,
          videoTemplateFile: null,
          sound: null,
          other: null,
          // Reset texture maps
          ambientOcclusion: null,
          baseColor: null,
          displacement: null,
          normal: null,
          roughness: null,
          metallic: null,
          bump: null,
          idmap: null
        });
        setErrors({});
      }, 2000);
      
    } catch (error) {
      console.error("Upload failed:", error);
      setLoadingState({
        isLoading: false,
        message: `Error: ${error.message}`,
        progress: 0
      });
    }
  };

  // Reset loading state after 5 seconds
  useEffect(() => {
    if (loadingState.message.includes("successful") || loadingState.message.includes("Error")) {
      const timer = setTimeout(() => {
        setLoadingState({ isLoading: false, message: "", progress: 0 });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loadingState]);

  if (!currentUser) {
    return (
      <div className="page_content">
        <div className="not_logged_in">
          <h2>Log in to upload assets</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Upload | YourSite</title>
        <meta name="description" content="Upload your assets to our platform" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Upload | YourSite" />
        <meta property="og:description" content="Upload your assets to our platform" />
      </Helmet>

      <div className="page_content">
        <div className="upload_section">
          {loadingState.isLoading && (
            <LoadingOverlay 
              message={loadingState.message} 
              progress={loadingState.progress} 
            />
          )}
          
          <form onSubmit={handleSubmit}>
            <PageTitle title="Upload Asset">Upload</PageTitle>

            <div className="content">
              <div className="left">
                {/* Thumbnail Upload */}
                <FileUpload 
                  label="Thumbnail*"
                  name="thumbnail"
                  accept="image/*"
                  file={formData.thumbnail}
                  onChange={handleChange}
                  error={errors.thumbnail}
                />
                
                {/* Title */}
                <div className="form-group">
                  <label htmlFor="title">Title*</label>
                  <input 
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Asset title"
                    className={errors.title ? "error" : ""}
                  />
                  {errors.title && <div className="error-message">{errors.title}</div>}
                </div>
              </div>

              <div className="right">
                {/* Description */}
                <div className="form-group">
                  <label>Description</label>
                  <DescriptionBox 
                    name="description" 
                    value={formData.description} 
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))} 
                  />
                </div>
                
                {/* Asset Type */}
                <AssetTypeSelector
                  value={formData.type}
                  onChange={handleChange}
                  error={errors.type}
                  options={Object.entries(ASSET_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: config.label
                  }))}
                />
                
                {/* Category */}
                <div className="form-group">
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={errors.category ? "error" : ""}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <div className="error-message">{errors.category}</div>}
                </div>
                
                {/* Metadata Filters */}
                <div className="metadata-filters">
                  {Object.entries(FILTER_OPTIONS).map(([name, options]) => (
                    <div key={name} className="form-group">
                      <label htmlFor={name}>{name.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <select
                        id={name}
                        name={name}
                        value={Array.isArray(formData[name]) ? undefined : formData[name]}
                        onChange={handleChange}
                        multiple={Array.isArray(formData[name])}
                      >
                        <option value="">Select {name}</option>
                        {options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                
                {/* Pricing */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price ($)</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={errors.price ? "error" : ""}
                    />
                    {errors.price && <div className="error-message">{errors.price}</div>}
                  </div>
                  
                  {formData.price && parseFloat(formData.price) > 0 && (
                    <div className="form-group">
                      <label htmlFor="discount">Discount (%)</label>
                      <input
                        id="discount"
                        name="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={handleChange}
                        placeholder="0"
                        className={errors.discount ? "error" : ""}
                      />
                      {errors.discount && <div className="error-message">{errors.discount}</div>}
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                <div className="form-group">
                  <label>Tags*</label>
                  <TagInput
                    tags={formData.tags}
                    onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                    error={errors.tags}
                  />
                </div>
                
                {/* Asset Type Specific Fields */}
                <AssetTypeFields
                  type={formData.type}
                  formData={formData}
                  onChange={handleChange}
                  assetConfig={ASSET_CONFIG}
                  errors={errors}
                />
                
                <button type="submit" className="submit-button">
                  Upload Asset
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Upload;