import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { storage } from "../../firebase";
import PageTitle from "../Components/UI/PageTitle";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "../Context/UserProvider";
import { Helmet } from "react-helmet";
import plus_icon from "../assets/Icons/plus.png";
import DescriptionBox from "../Components/DescriptionBox";

// filterData remains unchanged

const assetTypeToFilterData = {
  videos: "Videos",
  "video-templates": "VideoTemplates",
  images: "Pictures",
  graphics: "GraphicTemplates",
  mockups: "Mockups",
  fonts: "Fonts",
  models: "3DModels",
  icons: "Icons",
  textures: "Textures",
  hdris: "HDRIs",
  scripts: "Scripts",
  sounds: null,
  other: null,
};

const Upload = () => {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    title: "",
    thumbnail: null,
    description: "",
    is3d: false,
    price: "",
    discount: "",
    tags: "",
    date: new Date(), // Store as Date object
    category: "",
    type: "",
    model: null,
    images: [],
    video: null,
    icons: [],
    script: null,
    scriptSize: "",
    hdri: null,
    hdriSize: "",
    graphicsTemplate: null,
    graphicsTemplateSize: "",
    mockupFile: null,
    mockupFileSize: "",
    fontFile: null,
    fontFileSize: "",
    videoTemplateFile: null,
    videoTemplateFileSize: "",
    sound: null,
    soundSize: "",
    other: null,
    otherSize: "",
    ambientOcclusion: null,
    baseColor: null,
    displacement: null,
    normal: null,
    roughness: null,
    metallic: null,
    bump: null,
    idmap: null,
    resolution: "",
    physicalSize: "",
    lods: "",
    vertices: "",
    textures: false, // Initialize as boolean
    materials: false, // Initialize as boolean
    uvMapping: false,
    rigged: false,
    animated: false,
    vrArLowPoly: false,
    aiGenerated: "",
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
  });

  const [tags, setTags] = useState([]);
  const [loadingState, setLoadingState] = useState(false);

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    if (value === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
      return;
    }
    if (value.endsWith(" ")) {
      const newTag = value.slice(0, -1).trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setFormData({ ...formData, tags: "" });
    } else {
      setFormData({ ...formData, tags: value });
    }
  };

  const uploadFile = async (file, fileType) => {
    if (!file) return null;
    try {
      setLoadingState(`Uploading ${fileType} ${file.name}`);
      const storageRef = ref(storage, `assets/${fileType}/${file.name}`);
      const uploadSnapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(uploadSnapshot.ref);
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      return null;
    }
  };

  const uploadThumbnail = async (file) => {
    if (!file) return null;
    try {
      setLoadingState(`Uploading thumbnail`);
      const storageRef = ref(storage, `thumbnails/${file.name}`);
      const uploadSnapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(uploadSnapshot.ref);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert("Error uploading thumbnail");
      return null;
    }
  };

  const uploadImages = async (files, fileType) => {
    if (!files || files.length === 0) return [];
    try {
      setLoadingState(`Uploading ${fileType} (${files.length} files)`);
      const urls = await Promise.all(files.map((file) => uploadFile(file, fileType)));
      return urls.filter(url => url !== null);
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      return [];
    }
  };

  const handleChange = (event) => {
    const target = event.target;
    const name = target.name;
    let value = target.type === "checkbox" ? target.checked : target.value;

    if (target.type === "file") {
      if (name === "images" || name === "icons") {
        const files = Array.from(target.files);
        setFormData({
          ...formData,
          [name]: files,
          [`${name}Size`]: files.map((file) => file.size),
        });
      } else {
        const file = target.files[0] || null;
        setFormData({
          ...formData,
          [name]: file,
          [`${name}Size`]: file ? file.size : "",
        });
      }
    } else if (["properties", "applicationsSupported", "integrationReady"].includes(name)) {
      const options = Array.from(target.selectedOptions).map((option) => option.value);
      setFormData({
        ...formData,
        [name]: options,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tags.length === 0) {
      alert("Please add at least one tag");
      return;
    }
    
    setLoadingState("Uploading asset...");

    try {
      let docData = {
        title: formData.title,
        thumbnail: await uploadThumbnail(formData.thumbnail),
        description: formData.description,
        is3d: formData.is3d,
        price: formData.price,
        discount: formData.discount,
        category: formData.category,
        type: formData.type,
        tags: tags,
        date: formData.date, // Already a Date object
        userId: currentUser?.uid ?? "anonymous",
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
      };

      // Handle each asset type specifically
      if (formData.type === "models") {
        docData = {
          ...docData,
          model: await uploadFile(formData.model, "model"),
          modelName: formData.model?.name,
          modelSize: formData.model?.size,
          resolution: formData.resolution,
          physicalSize: formData.physicalSize,
          lods: formData.lods,
          vertices: formData.vertices,
          textures: formData.textures,
          materials: formData.materials,
          uvMapping: formData.uvMapping,
          rigged: formData.rigged,
          animated: formData.animated,
          vrArLowPoly: formData.vrArLowPoly,
        };
      }

      if (formData.type === "scripts") {
        docData = {
          ...docData,
          script: await uploadFile(formData.script, "script"),
          scriptName: formData.script?.name,
          scriptSize: formData.script?.size,
        };
      }

      if (formData.type === "hdris") {
        docData = {
          ...docData,
          hdri: await uploadFile(formData.hdri, "hdri"),
          hdriName: formData.hdri?.name,
          hdriSize: formData.hdri?.size,
        };
      }

      if (formData.type === "graphics") {
        docData = {
          ...docData,
          graphicsTemplate: await uploadFile(formData.graphicsTemplate, "graphicsTemplate"),
          graphicsTemplateName: formData.graphicsTemplate?.name,
          graphicsTemplateSize: formData.graphicsTemplate?.size,
        };
      }

      if (formData.type === "mockups") {
        docData = {
          ...docData,
          mockupFile: await uploadFile(formData.mockupFile, "mockup"),
          mockupFileName: formData.mockupFile?.name,
          mockupFileSize: formData.mockupFile?.size,
        };
      }

      if (formData.type === "fonts") {
        docData = {
          ...docData,
          fontFile: await uploadFile(formData.fontFile, "font"),
          fontFileName: formData.fontFile?.name,
          fontFileSize: formData.fontFile?.size,
        };
      }

      if (formData.type === "video-templates") {
        docData = {
          ...docData,
          videoTemplateFile: await uploadFile(formData.videoTemplateFile, "videoTemplate"),
          videoTemplateFileName: formData.videoTemplateFile?.name,
          videoTemplateFileSize: formData.videoTemplateFile?.size,
        };
      }

      if (formData.type === "videos") {
        docData = {
          ...docData,
          video: await uploadFile(formData.video, "video"),
          videoName: formData.video?.name,
          videoSize: formData.video?.size,
        };
      }

      if (formData.type === "icons") {
        const uploadedIcons = await uploadImages(formData.icons, "icon");
        docData = {
          ...docData,
          icons: uploadedIcons,
          iconNames: formData.icons.map((icon) => icon.name),
          iconSizes: formData.icons.map((icon) => icon.size),
        };
      }

      if (formData.type === "images") {
        const uploadedImages = await uploadImages(formData.images, "image");
        docData = {
          ...docData,
          images: uploadedImages,
          imageNames: formData.images.map((image) => image.name),
          imageSizes: formData.images.map((image) => image.size),
        };
      }

      if (formData.type === "textures") {
        const maps = ["ambientOcclusion", "baseColor", "displacement", "normal", "roughness", "metallic", "bump", "idmap"];
        const textureResults = {};
        
        for (const map of maps) {
          if (formData[map]) {
            const url = await uploadFile(formData[map], map);
            if (url) {
              textureResults[map] = url;
              textureResults[`${map}Name`] = formData[map].name;
            }
          }
        }
        
        docData = {
          ...docData,
          ...textureResults
        };
      }

      if (formData.type === "sounds") {
        docData = {
          ...docData,
          sound: await uploadFile(formData.sound, "sound"),
          soundName: formData.sound?.name,
          soundSize: formData.sound?.size,
        };
      }

      if (formData.type === "other") {
        docData = {
          ...docData,
          other: await uploadFile(formData.other, "other"),
          otherName: formData.other?.name,
          otherSize: formData.other?.size,
        };
      }

      // Remove empty fields
      docData = Object.fromEntries(Object.entries(docData).filter(([_, v]) => 
        v !== undefined && v !== "" && v !== null && !(Array.isArray(v) && v.length === 0)
      ));

      await addDoc(collection(db, "Assets"), docData);
      setLoadingState("success");
    } catch (error) {
      console.error("Error adding document: ", error);
      setLoadingState("Error uploading asset");
    }
  };

  // getCategoryOptions and getFilterOptions remain unchanged

  const renderFilterSelect = (filterKey, label, name, isMulti = false) => {
    const options = getFilterOptions(filterKey);
    if (options.length === 0) return null;
    return (
      <div className="select-wrapper">
        <label htmlFor={`${name}_select`}>{label}</label>
        <select
          name={name}
          id={`${name}_select`}
          className="filter-select"
          onChange={handleChange}
          multiple={isMulti}
          value={isMulti ? formData[name] : formData[name] || ""}
          required={!isMulti}
        >
          <option value="" disabled>
            Select {label}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Upload | Shammarianas</title>
        <meta name="description" content="Upload your assets to Shammarianas" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Upload | Shammarianas" />
        <meta property="og:description" content="Upload your assets to Shammarianas" />
      </Helmet>

      {/* CSS styles remain unchanged */}

      {currentUser ? (
        <div className="page_content">
          <div className="upload_section">
            {loadingState && (
              <div className="uploading_overlay">
                <div className={`spinner ${loadingState === "success" ? "success" : ""}`}>
                  {loadingState === "success" && <i className="icon fas fa-check"></i>}
                </div>
                <span>{loadingState}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <PageTitle title="Upload Asset">Upload</PageTitle>

              <div className="content">
                <div className="left">
                  <label htmlFor="thumbnail_input">Thumbnail</label>
                  <input 
                    type="file" 
                    required 
                    name="thumbnail" 
                    id="thumbnail_input" 
                    accept="image/*" 
                    onChange={handleChange} 
                  />
                  <label htmlFor="thumbnail_input" className="thumbnail_input_label">
                    {formData.thumbnail ? (
                      <div className="thumbnail_preview">
                        <img className="image" src={URL.createObjectURL(formData.thumbnail)} alt="thumbnail" />
                        <span className="file_name">{formData.thumbnail.name}</span>
                      </div>
                    ) : (
                      <>
                        <img className="upload_icon" src={plus_icon} alt="Add Thumbnail" />
                        <span className="placeholder">Choose Thumbnail</span>
                      </>
                    )}
                  </label>

                  <input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="Title" 
                    required 
                  />
                </div>

                <div className="right">
                  <DescriptionBox 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                  />
                  
                  <div className="select-wrapper">
                    <label htmlFor="type_select">Asset Type</label>
                    <select 
                      name="type" 
                      id="type_select" 
                      className="filter-select" 
                      onChange={handleChange} 
                      required
                      value={formData.type}
                    >
                      <option value="" disabled>Select Asset Type</option>
                      <option value="models">3D Model</option>
                      <option value="textures">Texture</option>
                      <option value="sounds">Sound</option>
                      <option value="scripts">Script</option>
                      <option value="images">Image</option>
                      <option value="graphics">Graphics Templates</option>
                      <option value="mockups">Mockups</option>
                      <option value="fonts">Fonts</option>
                      <option value="videos">Video</option>
                      <option value="video-templates">Video Templates</option>
                      <option value="icons">Icons</option>
                      <option value="hdris">HDRIs</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="select-wrapper">
                    <label htmlFor="category_select">Category</label>
                    <select 
                      name="category" 
                      id="category_select" 
                      className="filter-select" 
                      onChange={handleChange} 
                      required 
                      value={formData.category}
                    >
                      <option value="" disabled>Select Category</option>
                      {getCategoryOptions().map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Render filter selects */}
                  {renderFilterSelect("aiGenerated", "AI-Generated", "aiGenerated")}
                  {renderFilterSelect("resolution", "Resolution", "resolution")}
                  {renderFilterSelect("frameRate", "Frame Rate", "frameRate")}
                  {renderFilterSelect("properties", "Properties", "properties", true)}
                  {renderFilterSelect("applicationsSupported", "Applications Supported", "applicationsSupported", true)}
                  {renderFilterSelect("orientation", "Orientation", "orientation")}
                  {renderFilterSelect("licenseType", "License Type", "licenseType")}
                  {renderFilterSelect("surfaceMaterial", "Surface Material", "surfaceMaterial")}
                  {renderFilterSelect("style", "Style", "style")}
                  {renderFilterSelect("environmentType", "Environment Type", "environmentType")}
                  {renderFilterSelect("lightingCondition", "Lighting Condition", "lightingCondition")}
                  {renderFilterSelect("scriptType", "Script Type", "scriptType")}
                  {renderFilterSelect("programmingLanguage", "Programming Language", "programmingLanguage")}
                  {renderFilterSelect("framework", "Framework", "framework")}
                  {renderFilterSelect("integrationReady", "Integration Ready", "integrationReady", true)}
                  {renderFilterSelect("colorSpace", "Color Space", "colorSpace")}
                  {renderFilterSelect("objectType", "Object Type", "objectType")}
                  {renderFilterSelect("fileFormat", "File Format", "fileFormat")}
                  
                  <input 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    placeholder="Price" 
                    type="number" 
                    min="0" 
                    max="999" 
                    required 
                  />
                  
                  {formData.price && parseFloat(formData.price) > 0 && (
                    <input 
                      name="discount" 
                      value={formData.discount} 
                      onChange={handleChange} 
                      placeholder="Discount" 
                      type="number" 
                      min="0" 
                      max="100" 
                    />
                  )}
                  
                  <div className="tags_input">
                    {tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    <input 
                      name="tags" 
                      value={formData.tags} 
                      onChange={handleTagInputChange} 
                      placeholder="Tags (space-separated)" 
                    />
                  </div>
                  
                  {/* Asset type specific fields */}
                  {formData.type === "models" && (
                    <>
                      <label>Is 3D</label>
                      <label>
                        <input name="is3d" type="checkbox" checked={true} disabled />
                        Is 3D
                      </label>
                      
                      <label htmlFor="model_input">Model File</label>
                      <input 
                        name="model" 
                        id="model_input" 
                        type="file" 
                        accept=".glb,.gltf,.stl,.obj,.fbx,.blend" 
                        onChange={handleChange} 
                        required 
                      />
                      
                      <label htmlFor="model_input" className="custom-file-input">
                        {formData.model ? (
                          <div className="file_preview">
                            <span className="file_name">{formData.model.name}</span>
                          </div>
                        ) : (
                          <>
                            <img className="upload_icon" src={plus_icon} alt="Add Model" />
                            <span className="placeholder">Choose Model File</span>
                          </>
                        )}
                      </label>
                      
                      <input name="vertices" type="number" placeholder="Vertices" onChange={handleChange} required />
                      <input name="physicalSize" type="text" placeholder="Physical Size" onChange={handleChange} required />
                      <input name="lods" type="number" placeholder="LODs" onChange={handleChange} required />
                      
                      <div className="checkboxes">
                        {["textures", "materials", "rigged", "animated", "uvMapping", "vrArLowPoly"].map((prop) => (
                          <label key={prop}>
                            <input 
                              type="checkbox" 
                              name={prop} 
                              checked={formData[prop]} 
                              onChange={handleChange} 
                            />
                            {prop
                              .split(/(?=[A-Z])/)
                              .join(" ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {formData.type === "textures" && (
                    <>
                      {["ambientOcclusion", "baseColor", "displacement", "normal", "roughness", "metallic", "bump", "idmap"].map((map) => (
                        <div key={map}>
                          <label htmlFor={`${map}_input`}>
                            {map
                              .split(/(?=[A-Z])/)
                              .join(" ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </label>
                          <input 
                            type="file" 
                            name={map} 
                            id={`${map}_input`} 
                            accept=".png,.jpg,.jpeg" 
                            onChange={handleChange} 
                          />
                          <label htmlFor={`${map}_input`} className="custom-file-input">
                            {formData[map] ? (
                              <div className="file_preview">
                                <img className="image" src={URL.createObjectURL(formData[map])} alt={map} />
                                <span className="file_name">{formData[map].name}</span>
                              </div>
                            ) : (
                              <>
                                <img className="upload_icon" src={plus_icon} alt={`Add ${map}`} />
                                <span className="placeholder">
                                  Choose {map.split(/(?=[A-Z])/).join(" ").replace(/\b\w/g, c => c.toUpperCase())} File
                                </span>
                              </>
                            )}
                          </label>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {/* Other asset type sections remain similar with null checks */}
                  
                  <button type="submit">Upload</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="page_content">
          <div className="not_logged_in">
            <h2>Log in to upload assets</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default Upload;