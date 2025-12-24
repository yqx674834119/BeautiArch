# ==============================================================================
# BeautiArch AI 模型配置文件
# ==============================================================================
# 
# 本文件集中管理所有 AI 模型配置。
# 修改此文件可以切换使用的模型，无需修改核心代码。
#
# ⚠️ 重要说明：
# - 修改后需要重启后端才能生效
# - 标记为 [可替换] 的模型可以安全切换
# - 标记为 [不建议替换] 的模型替换可能导致功能异常
# - 所有模型会自动下载到 ./models 目录
#
# ==============================================================================

# ==============================================================================
# 基础扩散模型 (Base Diffusion Models)
# ==============================================================================
# 
# [可替换] ✅ 
# 用途: 图像生成的核心模型，决定输出的整体质量和风格
# 
# 替换要求:
# - 必须是 Stable Diffusion 1.5 架构 (SD1.5)
# - 如需使用 SDXL，需使用 load_models_multiple_cn_hyperXL 函数
# - 某些模型没有 fp16 变体，设置 has_fp16=False
#
# 推荐模型:
# - Dreamshaper: 艺术风格，创意图像
# - Realistic Vision: 真实人物/场景
# - Absolute Reality: 高写实建筑/室内
# - Photon: 自然光照效果好

BASE_MODELS = {
    "dreamshaper8": {
        "id": "Lykon/dreamshaper-8",
        "name": "Dreamshaper 8",
        "description": "通用艺术风格模型，适合创意和概念设计",
        "style": "artistic",
        "has_fp16": True,  # 支持 fp16 加速
    },
    "realistic_vision_v6": {
        "id": "SG161222/Realistic_Vision_V6.0_B1_noVAE",
        "name": "Realistic Vision V6",
        "description": "照片级真实感，适合人物和场景",
        "style": "photorealistic",
        "has_fp16": False,  # 不支持 fp16，加载时不要用 variant="fp16"
    },
    "absolute_reality": {
        "id": "digiplay/AbsoluteReality_v1.8.1",
        "name": "Absolute Reality 1.8.1",
        "description": "极致真实感，非常适合建筑和室内渲染",
        "style": "photorealistic",
        "has_fp16": False,
    },
    "photon": {
        "id": "sontung/photon_v1",
        "name": "Photon V1",
        "description": "光影效果优秀，适合自然光照场景",
        "style": "photorealistic",
        "has_fp16": False,
    },
}

# 👇 修改这里切换基础模型
DEFAULT_BASE_MODEL = "absolute_reality"


# ==============================================================================
# ControlNet 模型
# ==============================================================================
#
# [部分可替换] ⚠️
# 用途: 根据输入信号控制生成结果的结构
#
# scribble 和 seg:
#   - 这两个是核心功能，替换需要同时修改 UI 的输入方式
#   - 例如替换 scribble 为 canny，需要前端也改成边缘检测输入
#
# tile:
#   - 用于超分辨率功能，可以替换为其他 tile 模型
#
# 替换要求:
# - 必须与基础模型架构匹配 (SD1.5 用 sd-controlnet-*, SDXL 用 sdxl-controlnet-*)

CONTROLNET_MODELS = {
    # ----- 核心 ControlNet（程序功能依赖）-----
    "scribble": {
        "id": "lllyasviel/sd-controlnet-scribble",
        "name": "Scribble ControlNet",
        "description": "线稿草图控制 - 将用户绘制的线条转化为输出边缘",
        "replaceable": False,  # 替换需同时修改前端输入逻辑
        "alternatives": [
            "lllyasviel/sd-controlnet-canny",  # 需要边缘检测预处理
            "lllyasviel/sd-controlnet-hed",    # 需要 HED 预处理
        ],
    },
    "segmentation": {
        "id": "lllyasviel/sd-controlnet-seg",
        "name": "Segmentation ControlNet",
        "description": "语义分割控制 - 将颜色块转化为材质区域（墙/地板/窗等）",
        "replaceable": False,  # 替换需使用相同的颜色编码格式
        "alternatives": [],
    },
    
    # ----- 可替换 ControlNet -----
    "tile": {
        "id": "lllyasviel/control_v11f1e_sd15_tile",
        "name": "Tile ControlNet",
        "description": "细节保持放大 - 用于 Upscale 功能",
        "replaceable": True,
        "alternatives": [],
    },
    
    # ----- 备用 ControlNet（未使用但可扩展）-----
    "canny": {
        "id": "lllyasviel/sd-controlnet-canny",
        "name": "Canny ControlNet",
        "description": "边缘检测控制 - 比 scribble 更精确的线条控制",
        "replaceable": True,
        "alternatives": [],
    },
    "depth": {
        "id": "lllyasviel/sd-controlnet-depth",
        "name": "Depth ControlNet",
        "description": "深度图控制 - 可用于 3D 场景渲染",
        "replaceable": True,
        "alternatives": [],
    },
}

# 👇 当前使用的 ControlNet 组合
ACTIVE_CONTROLNETS = ["scribble", "segmentation"]  # 主推理
UPSCALE_CONTROLNET = "tile"  # 超分辨率


# ==============================================================================
# IP-Adapter 模型 (风格迁移)
# ==============================================================================
#
# [可替换] ✅
# 用途: 从参考图像提取风格并应用到生成结果
#
# 替换要求:
# - SD1.5 模型使用 sd15 系列
# - SDXL 模型使用 sdxl 系列
#
# 效果差异:
# - base: 平衡版，风格迁移适中
# - plus: 更强风格迁移，内容相似度更高
# - face: 专门用于面部特征迁移

IP_ADAPTER_MODELS = {
    "sd15_base": {
        "repo": "h94/IP-Adapter",
        "weight": "ip-adapter_sd15.bin",
        "subfolder": "models",
        "name": "IP-Adapter SD1.5 Base",
        "description": "基础风格迁移，平衡性好",
        "for_architecture": "sd15",
    },
    "sd15_plus": {
        "repo": "h94/IP-Adapter",
        "weight": "ip-adapter-plus_sd15.bin",
        "subfolder": "models",
        "name": "IP-Adapter Plus",
        "description": "更强的风格迁移效果，内容更接近参考图",
        "for_architecture": "sd15",
    },
    "sd15_face": {
        "repo": "h94/IP-Adapter",
        "weight": "ip-adapter-full-face_sd15.bin",
        "subfolder": "models",
        "name": "IP-Adapter Face",
        "description": "面部特征迁移专用",
        "for_architecture": "sd15",
    },
    "sdxl_base": {
        "repo": "h94/IP-Adapter",
        "weight": "ip-adapter_sdxl.bin",
        "subfolder": "sdxl_models",
        "name": "IP-Adapter SDXL",
        "description": "SDXL 架构的风格迁移",
        "for_architecture": "sdxl",
    },
}

# 👇 当前使用的 IP-Adapter
DEFAULT_IP_ADAPTER = "sd15_plus"


# ==============================================================================
# 加速 LoRA 模型
# ==============================================================================
#
# [可替换] ✅ 但需要同时修改调度器
# 用途: 减少推理步数，加速生成
#
# 重要: 每种加速方案需要配套的调度器 (Scheduler)
# - LCM: 使用 LCMScheduler
# - Hyper-SD: 使用 TCDScheduler
#
# 质量对比:
# - LCM: 4-8步，速度快，质量中等
# - Hyper-SD: 12步，速度中等，质量更好

ACCELERATION_LORAS = {
    "lcm": {
        "type": "hf_model",  # 从 HuggingFace 加载
        "id": "latent-consistency/lcm-lora-sdv1-5",
        "name": "LCM LoRA",
        "description": "Latent Consistency Model - 4-8步快速生成",
        "scheduler": "LCMScheduler",  # 必须使用此调度器
        "recommended_steps": 8,
        "for_architecture": "sd15",
    },
    "hyper_sd15": {
        "type": "hf_download",  # 需要 hf_hub_download
        "repo": "ByteDance/Hyper-SD",
        "weight": "Hyper-SD15-12steps-CFG-lora.safetensors",
        "name": "Hyper-SD 15",
        "description": "ByteDance 加速方案 - 12步生成更高质量",
        "scheduler": "TCDScheduler",  # 必须使用此调度器
        "recommended_steps": 12,
        "for_architecture": "sd15",
    },
    "hyper_sdxl": {
        "type": "hf_download",
        "repo": "ByteDance/Hyper-SD",
        "weight": "Hyper-SDXL-1step-lora.safetensors",
        "name": "Hyper-SD XL",
        "description": "SDXL 版本的 Hyper-SD - 1步极速生成",
        "scheduler": "TCDScheduler",
        "recommended_steps": 1,
        "for_architecture": "sdxl",
    },
}

# 👇 当前使用的加速方案 (标准模式用 lcm，高质量模式用 hyper_sd15)
DEFAULT_ACCELERATION = "lcm"
HYPER_ACCELERATION = "hyper_sd15"


# ==============================================================================
# 语义分割模型
# ==============================================================================
#
# [不建议替换] ❌
# 用途: 将导入的图像自动转换为语义分割图
#
# 为什么不建议替换:
# - 模型输出的类别索引与 PALETTE 颜色映射绑定
# - 替换需要同时修改 PALETTE 常量和前端颜色选择器
# - 不同模型的类别定义可能不同

SEGMENTATION_MODELS = {
    "upernet": {
        "id": "openmmlab/upernet-convnext-small",
        "name": "UperNet ConvNeXt Small",
        "description": "通用语义分割，支持150个ADE20K类别",
        "replaceable": False,  # 替换需同步修改 PALETTE 和 UI
        "reason": "输出类别与颜色映射绑定",
    },
}


# ==============================================================================
# 超分辨率模型
# ==============================================================================
#
# [可替换] ✅
# 用途: 放大生成的图像

UPSCALE_MODELS = {
    "sd_x4": {
        "id": "stabilityai/stable-diffusion-x4-upscaler",
        "name": "SD x4 Upscaler",
        "description": "官方 4 倍放大，质量好但较慢",
        "scale": 4,
        "type": "diffusion",
    },
    "realesrgan_x2": {
        "path": "models/upscale/RealESRGAN_x2.pth",
        "name": "RealESRGAN x2",
        "description": "快速 2 倍放大",
        "scale": 2,
        "type": "gan",
    },
    "realesrgan_x4": {
        "path": "models/upscale/RealESRGAN_x4.pth",
        "name": "RealESRGAN x4",
        "description": "快速 4 倍放大",
        "scale": 4,
        "type": "gan",
    },
}


# ==============================================================================
# SDXL 特定模型
# ==============================================================================
#
# [可替换] ✅ 但仅用于 SDXL 流程
# 仅在使用 load_models_multiple_cn_hyperXL 时生效

SDXL_MODELS = {
    "base": {
        "id": "custom_models/realvisxlV40_v40Bakedvae.safetensors",
        "name": "RealVis XL V4",
        "description": "SDXL 真实感模型",
    },
    "controlnet_scribble": {
        "id": "xinsir/controlnet-scribble-sdxl-1.0",
        "name": "SDXL Scribble ControlNet",
        "description": "SDXL 版本的线稿控制",
    },
    "vae": {
        "id": "madebyollin/sdxl-vae-fp16-fix",
        "name": "SDXL VAE FP16 Fix",
        "description": "修复 SDXL fp16 推理问题的 VAE",
    },
}


# ==============================================================================
# 默认推理参数
# ==============================================================================
#
# [可替换] ✅ 调整生成效果

INFERENCE_DEFAULTS = {
    "num_inference_steps": 8,          # 推理步数（LCM模式）
    "guidance_scale": 1.0,             # CFG 强度
    "controlnet_conditioning_scale": [0.9, 0.9],  # ControlNet 强度 [线稿, 分割]
    "ip_adapter_scale": 0.8,           # IP-Adapter 风格强度
    "eta": 1.0,                        # 噪声调度参数
}


# ==============================================================================
# 辅助函数
# ==============================================================================

def get_base_model_id():
    """获取当前基础模型的 HuggingFace ID"""
    return BASE_MODELS[DEFAULT_BASE_MODEL]["id"]

def get_base_model_has_fp16():
    """检查当前基础模型是否支持 fp16 变体"""
    return BASE_MODELS[DEFAULT_BASE_MODEL].get("has_fp16", False)

def get_controlnet_id(name):
    """获取 ControlNet 模型 ID"""
    return CONTROLNET_MODELS[name]["id"]

def get_ip_adapter_config():
    """获取当前 IP-Adapter 配置"""
    return IP_ADAPTER_MODELS[DEFAULT_IP_ADAPTER]

def get_acceleration_config(hyper=False):
    """获取加速方案配置"""
    key = HYPER_ACCELERATION if hyper else DEFAULT_ACCELERATION
    return ACCELERATION_LORAS[key]

def get_upscale_controlnet_id():
    """获取超分辨率 ControlNet ID"""
    return CONTROLNET_MODELS[UPSCALE_CONTROLNET]["id"]
