import { Request, Response } from "express";
import Flyer from "../models/flyer/Flyer";
import ProductSpecification from "../models/flyer/Specification";
import { generateStyledFlyerPdf } from "../utils/generateStyledFlyerPdf";
import generateSingleStyledFlyerPdf from "../utils/generateStyledFlyerSinglePdf";
import { sendEmail } from "../utils/sendEmail";
import {generateStyledFlyerImage, generateStyledSingleFlyerImage } from "../utils/convertPdfToJpg";

// Helper for simple validation
function validateFlyerData(data: any) {
  const errors: string[] = [];

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim() === ""
  ) {
    errors.push("Title is required and must be a non-empty string.");
  }

  if (data.productOneImageUrl && typeof data.productOneImageUrl !== "string") {
    errors.push("productOneImageUrl must be a string.");
  }

  if (data.productTwoImageUrl && typeof data.productTwoImageUrl !== "string") {
    errors.push("productTwoImageUrl must be a string.");
  }

  if (
    data.productSpecificationIdOne !== undefined &&
    data.productSpecificationIdOne !== null &&
    !Number.isInteger(data.productSpecificationIdOne)
  ) {
    errors.push("productSpecificationIdOne must be an integer.");
  }

  if (
    data.productSpecificationIdTwo !== undefined &&
    data.productSpecificationIdTwo !== null &&
    !Number.isInteger(data.productSpecificationIdTwo)
  ) {
    errors.push("productSpecificationIdTwo must be an integer.");
  }

  if (data.description && typeof data.description !== "string") {
    errors.push("Description must be a string.");
  }

  return errors;
}
const createsFlyer = async (req: Request, res: Response): Promise<void> => {
  console.log("flyer api calls")
  try {
    const errors = validateFlyerData(req.body);
    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }
    console.log(req.body.prodcutoneimageUrl)
    const {
      title,
      description,
      prodcutoneimageUrl,
      prodcutwoimageUrl,
      productSpecificationId,
      productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
      CrmID,
    } = req.body;
      console.log(req.body)
    // Validate product specifications
    const productSpecOne: any = productSpecificationId
      ? await ProductSpecification.findByPk(productSpecificationId)
      : null;
    if (productSpecificationId && !productSpecOne) {
      res
        .status(400)
        .json({ success: false, message: "Invalid productSpecificationIdOne" });
      return;
    }

    const productSpecTwo: any = productSpecificationIdtwo
      ? await ProductSpecification.findByPk(productSpecificationIdtwo)
      : null;
    if (productSpecificationIdtwo && !productSpecTwo) {
      res
        .status(400)
        .json({ success: false, message: "Invalid productSpecificationIdTwo" });
      return;
    }
    console.log("there are any error ")
    // Build specs array
    const specKeys = [
      "processor",
      "operatingSystem",
      "memory",
      "wirelessCarPlayAndroidAuto",
      "audioVideoOutput",
      "amplifier",
      "cameraInputs",
      "microphone",
      "bluetooth",
      "usbPorts",
      "steeringWheelACControls",
      "factoryReversingCamera",
      "audioVideoFeatures",
      "radioTuner",
      "googlePlayStore",
      "netflix",
      "disneyPlus",
      "foxtel",
      "apps",
      "screenSize",
      "screenResolution",
      "onlineVideos",
    ];

    const friendlyNames: Record<string, string> = {
      processor: "Processor",
      operatingSystem: "OS",
      memory: "Memory",
      wirelessCarPlayAndroidAuto: "Apple CarPlay / Android Auto",
      audioVideoOutput: "Audio/Video Output",
      amplifier: "Amplifier",
      cameraInputs: "Camera Inputs",
      microphone: "Microphone",
      bluetooth: "Bluetooth",
      usbPorts: "USB Ports",
      steeringWheelACControls: "Steering Wheel AC Controls",
      factoryReversingCamera: "Factory Reversing Camera",
      audioVideoFeatures: "Audio/Video Features",
      radioTuner: "Radio Tuner",
      googlePlayStore: "Google Play Store",
      netflix: "Netflix",
      disneyPlus: "Disney Plus",
      foxtel: "Foxtel",
      apps: "Apps",
      screenSize: "Screen Size",
      screenResolution: "Screen Resolution",
      onlineVideos: "Online Videos",
    };

    const specs = specKeys.map((key) => ({
      feature: friendlyNames[key] || key,
      p1: productSpecOne?.[key] || "-",
      p2: productSpecTwo?.[key] || "-",
    }));
    console.log("specs")
    // Generate PDF and JPG
    // const pdfPath = await generateStyledFlyerPdf({
    //   flyerData: {
    //     customerName,
    //     customerPhone,
    //     customerEmail,
    //     installationFees,
    //     deliveryFees,
    //     quotationNumber,
    //     validationTime,
    //     logoUrl: "/logo.jpg",
    //   },
    //   firstProduct: {
    //     image: prodcutoneimageUrl,
    //     title: productSpecOne?.name || "Product One",
    //     price: installationFees,
    //   },
    //   secondProduct: {
    //     image: prodcutwoimageUrl,
    //     title: productSpecTwo?.name || "Product Two",
    //     price: deliveryFees,
    //   },
    //   specs,
    // });

    const jpgfile = await generateStyledFlyerImage({
      flyerData: {
        customerName,
        customerPhone,
        customerEmail,
        installationFees,
        deliveryFees,
        quotationNumber,
        validationTime,
        logoUrl: "/logo.jpg",
      },
      firstProduct: {
        image: prodcutoneimageUrl,
        title: productSpecOne?.name || "Product One",
        price: installationFees,
      },
      secondProduct: {
        image: prodcutwoimageUrl,
        title: productSpecTwo?.name || "Product Two",
        price: deliveryFees,
      },
      specs,
    });

    const flyerDataToSave = {
      title,
      description,
      productOneImageUrl: prodcutoneimageUrl,
      productTwoImageUrl: prodcutwoimageUrl,
      productSpecificationIdOne: productSpecificationId,
      productSpecificationIdTwo: productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
      // flyer_url: pdfPath,
      flyer_image_url: jpgfile,
      CrmID: CrmID || "",
    };

    // Check if flyer exists for this CrmID
    let flyer;

    if (CrmID) {
      flyer = await Flyer.findOne({ where: { CrmID } });
      console.log("there are crm console")
      if (flyer) {
        console.log("flyer update console")
        // Update existing flyer
        await flyer.update(flyerDataToSave);
        res.status(200).json({
          success: true,
          message: "Flyer updated successfully",
          data: flyer,
          // pdf: pdfPath,
        });
        return
      }
    }
    console.log("create console ")
    // If CrmID not provided OR flyer not found, create a new one
    flyer = await Flyer.create(flyerDataToSave);
    console.log("its all working ")
    res.status(201).json({
      success: true,
      message: "Flyer created successfully",
      // data: flyer,
      // pdf: pdfPath,
    });
  } catch (error: any) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllFlyers = async (req: Request, res: Response) => {
  try {
    // Get page & limit from query (default: page=1, limit=10)
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Count total flyers
    const totalFlyers = await Flyer.count();

    // Fetch flyers with pagination
    const flyers = await Flyer.findAll({
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: flyers,
      pagination: {
        total: totalFlyers,
        page,
        limit,
        totalPages: Math.ceil(totalFlyers / limit),
        hasNextPage: page < Math.ceil(totalFlyers / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get flyer by ID
const getFlyerById = async (req: Request, res: Response) => {
  try {
    const flyer = await Flyer.findByPk(req.params.id);
    if (!flyer) {
      res.status(404).json({ success: false, message: "Flyer not found" });
    }
    res.json({ success: true, data: flyer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update flyer by ID
const updateFlyer = async (req: Request, res: Response) => {
  try {
    const flyer = await Flyer.findByPk(req.params.id);
    if (!flyer) {
      res.status(404).json({ success: false, message: "Flyer not found" });
      return;
    }

    const errors = validateFlyerData(req.body);
    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    await flyer.update(req.body);
    res.json({ success: true, data: flyer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete flyer by ID
const deleteFlyer = async (req: Request, res: Response) => {
  try {
    const flyer = await Flyer.findByPk(req.params.id);
    if (!flyer) {
      res.status(404).json({ success: false, message: "Flyer not found" });
      return;
    }
    await flyer.destroy();
    res.json({ success: true, message: "Flyer deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSingleProdctFlyer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("this is single product API call");

    const errors = validateFlyerData(req.body);
    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const {
      title,
      description,
      prodcutoneimageUrl,
      prodcutwoimageUrl,
      productSpecificationId,
      productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
      CrmID,
    } = req.body;

    // Validate existence of product specifications
    const productSpecOne: any = productSpecificationId
      ? await ProductSpecification.findByPk(productSpecificationId)
      : null;
    if (productSpecificationId && !productSpecOne) {
      res.status(400).json({
        success: false,
        message: "Invalid productSpecificationIdOne",
      });
      return;
    }

    const productSpecTwo: any = productSpecificationIdtwo
      ? await ProductSpecification.findByPk(productSpecificationIdtwo)
      : null;
    if (productSpecificationIdtwo && !productSpecTwo) {
      res.status(400).json({
        success: false,
        message: "Invalid productSpecificationIdTwo",
      });
      return;
    }

    // Prepare specs array for PDF table
    const specKeys = [
      "processor",
      "operatingSystem",
      "memory",
      "wirelessCarPlayAndroidAuto",
      "audioVideoOutput",
      "amplifier",
      "cameraInputs",
      "microphone",
      "bluetooth",
      "usbPorts",
      "steeringWheelACControls",
      "factoryReversingCamera",
      "audioVideoFeatures",
      "radioTuner",
      "googlePlayStore",
      "netflix",
      "disneyPlus",
      "foxtel",
      "apps",
      "screenSize",
      "screenResolution",
      "onlineVideos",
    ];

    const friendlyNames: Record<string, string> = {
      processor: "Processor",
      operatingSystem: "OS",
      memory: "Memory",
      wirelessCarPlayAndroidAuto: "Apple CarPlay / Android Auto",
      audioVideoOutput: "Audio/Video Output",
      amplifier: "Amplifier",
      cameraInputs: "Camera Inputs",
      microphone: "Microphone",
      bluetooth: "Bluetooth",
      usbPorts: "USB Ports",
      steeringWheelACControls: "Steering Wheel AC Controls",
      factoryReversingCamera: "Factory Reversing Camera",
      audioVideoFeatures: "Audio/Video Features",
      radioTuner: "Radio Tuner",
      googlePlayStore: "Google Play Store",
      netflix: "Netflix",
      disneyPlus: "Disney Plus",
      foxtel: "Foxtel",
      apps: "Apps",
      screenSize: "Screen Size",
      screenResolution: "Screen Resolution",
      onlineVideos: "Online Videos",
    };

    const specs = specKeys.map((key) => ({
      feature: friendlyNames[key] || key,
      p1: productSpecOne?.[key] || "-",
      p2: productSpecTwo?.[key] || "-",
    }));

    // Generate PDF
    const pdfPath = await generateSingleStyledFlyerPdf({
      flyerData: {
        customerName,
        customerPhone,
        customerEmail,
        installationFees,
        deliveryFees,
        quotationNumber,
        validationTime,
        logoUrl: "/logo.jpg",
      },
      firstProduct: {
        image: prodcutoneimageUrl,
        title: productSpecOne?.name || "Product One",
        price: installationFees,
      },
      secondProduct: {
        image: prodcutwoimageUrl,
        title: productSpecTwo?.name || "Product Two",
        price: deliveryFees,
      },
      specs,
    });

    const jpgfile = await generateStyledSingleFlyerImage({
      flyerData: {
        customerName,
        customerPhone,
        customerEmail,
        installationFees,
        deliveryFees,
        quotationNumber,
        validationTime,
        logoUrl: "/logo.jpg",
      },
      firstProduct: {
        image: prodcutoneimageUrl,
        title: productSpecOne?.name || "Product One",
        price: installationFees,
      },
      secondProduct: {
        image: prodcutwoimageUrl,
        title: productSpecTwo?.name || "Product Two",
        price: deliveryFees,
      },
      specs,
    });
    console.log(jpgfile);

    const flyerDataToSave = {
      title,
      description,
      productOneImageUrl: prodcutoneimageUrl,
      productTwoImageUrl: prodcutwoimageUrl,
      productSpecificationIdOne: productSpecificationId,
      productSpecificationIdTwo: productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
      flyer_url: pdfPath.pdfPath,
      flyer_image_url: jpgfile,
      CrmID,
    };

    // Check if flyer exists for this CrmID
    // Check if flyer exists for this CrmID only if CrmID is provided
    let flyer;

    if (CrmID) {
      flyer = await Flyer.findOne({ where: { CrmID } });

      if (flyer) {
        // Update existing flyer
        await flyer.update(flyerDataToSave);
        res.status(200).json({
          success: true,
          message: "Flyer updated successfully",
          data: flyer,
          pdf: pdfPath,
        });
      }
    }

    // If CrmID not provided OR flyer not found, create a new one
    flyer = await Flyer.create(flyerDataToSave);
    res.status(201).json({
      success: true,
      message: "Flyer created successfully",
      data: flyer,
      pdf: pdfPath,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendFlyer = async (req: Request, res: Response) => {
  const { userData, combinedHtml, subject } = req.body;

  try {
    const result = await sendEmail({
      subject: subject || "Kayhan Audio Flyer",
      to: userData.email,
      bodyHtml: combinedHtml,
      from: "support@mailer.kayhanaudio.com.au",
    });

    res.status(200).json({
      success: true,
      message: "Flyer sent successfully",
      messageId: result.MessageId,
    });
    return;
  } catch (error: any) {
    console.error("Error sending flyer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send flyer",
      error: error.message,
    });
  }
};

export {
  createsFlyer,
  getAllFlyers,
  getFlyerById,
  updateFlyer,
  deleteFlyer,
  createSingleProdctFlyer,
  sendFlyer,
};
