# BeautiArch AI 模型与推理管道文档

本文档详细介绍了 BeautiArch 项目中使用的所有 AI 模型、它们的功能、位置以及如何修改它们。

---

## 📁 核心文件位置

| 文件 | 说明 |
|------|------|
| `/lcm.py` | 主要推理逻辑，包含所有模型加载和生成函数 |
| `/upscale_flow.py` | 高级超分辨率流程（RealESRGAN + ControlNet Tile） |
| `/backend/app/services/inference.py` | FastAPI 后端的推理服务封装 |

---

## 🧠 模型概览

### 1. 基础扩散模型 (Stable Diffusion)

| 属性 | 值 |
|------|------|
| **模型 ID** | `Lykon/dreamshaper-8` |
| **类型** | Stable Diffusion 1.5 微调版 |
| **功能** | 图像生成的核心模型 |
| **位置** | `lcm.py` 第 26 行, 第 483-560 行 |

**如何修改:**
```python
# lcm.py 第 26 行
model_ids = ["Lykon/dreamshaper-8"]

# 或在函数参数中修改
load_models_multiple_cn(model_id="你的模型ID")
```

**可替换为:**
- `runwayml/stable-diffusion-v1-5` - 原版 SD 1.5
- `SG161222/Realistic_Vision_V5.1` - 真实风格
- `stablediffusionapi/anything-v5` - 动漫风格
- 自定义 safetensors 文件: `custom_models/你的模型.safetensors`

---

### 2. ControlNet 模型

项目使用 **两个 ControlNet** 同时控制生成：

#### 2.1 线稿 ControlNet (Scribble)

| 属性 | 值 |
|------|------|
| **模型 ID** | `lllyasviel/sd-controlnet-scribble` |
| **功能** | 根据用户绘制的线稿控制图像结构 |
| **位置** | `lcm.py` 第 573 行 |

#### 2.2 语义分割 ControlNet (Seg)

| 属性 | 值 |
|------|------|
| **模型 ID** | `lllyasviel/sd-controlnet-seg` |
| **功能** | 根据颜色分割图控制区域材质/类型 |
| **位置** | `lcm.py` 第 574 行 |

**如何修改:**
```python
# lcm.py 第 572-574 行
controlnets = [
    ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-scribble", ...),
    ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-seg", ...)]
```

**可替换为:**
- `lllyasviel/sd-controlnet-canny` - 边缘检测
- `lllyasviel/sd-controlnet-depth` - 深度图
- `lllyasviel/sd-controlnet-normal` - 法线图

---

### 3. IP-Adapter (风格迁移)

| 属性 | 值 |
|------|------|
| **模型 ID** | `h94/IP-Adapter` |
| **权重文件** | `ip-adapter_sd15.bin` |
| **功能** | 从参考图像提取风格并应用到生成结果 |
| **位置** | `lcm.py` 第 426, 508, 598, 692 行 |

**这是 "Reference Image" 功能的核心！**

**如何修改:**
```python
# lcm.py 第 571 行
ip_adapter_name = "ip-adapter_sd15.bin"

# 强度控制 (默认 0.8)
pipe.set_ip_adapter_scale(ip_scale)
```

**可替换为:**
- `ip-adapter-plus_sd15.bin` - 更强的风格迁移
- `ip-adapter-full-face_sd15.bin` - 面部特化

---

### 4. 加速 LoRA 模型

项目支持两种加速方案：

#### 4.1 LCM-LoRA (Latent Consistency Model)

| 属性 | 值 |
|------|------|
| **模型 ID** | `latent-consistency/lcm-lora-sdv1-5` |
| **功能** | 将推理步数从 50 降至 4-8 步 |
| **调度器** | `LCMScheduler` |
| **位置** | `lcm.py` 第 491, 570 行 (函数 `load_models_multiple_cn`) |

#### 4.2 Hyper-SD (ByteDance)

| 属性 | 值 |
|------|------|
| **模型 ID** | `ByteDance/Hyper-SD` |
| **权重文件** | `Hyper-SD15-12steps-CFG-lora.safetensors` |
| **功能** | 更高质量的加速方案，12 步 |
| **调度器** | `TCDScheduler` |
| **位置** | `lcm.py` 第 662-663 行 (函数 `load_models_multiple_cn_hyper`) |

**如何切换:**
在后端 `inference.py` 中通过 `use_hyper` 参数控制：
```python
# 使用 LCM (更快)
service.generate(..., use_hyper=False)

# 使用 Hyper-SD (更好质量)
service.generate(..., use_hyper=True)
```

---

### 5. 语义分割模型 (UperNet)

| 属性 | 值 |
|------|------|
| **模型 ID** | `openmmlab/upernet-convnext-small` |
| **功能** | 将导入图像转换为语义分割图 |
| **位置** | `lcm.py` 第 231-275 行 (函数 `img_to_seg`) |

**使用场景:** 用户导入图片时，自动提取分割信息。

---

### 6. 超分辨率模型

#### 6.1 ControlNet Tile Upscaler

| 属性 | 值 |
|------|------|
| **模型 ID** | `lllyasviel/control_v11f1e_sd15_tile` |
| **功能** | 基于 ControlNet 的智能放大，保持细节 |
| **位置** | `lcm.py` 第 833-868 行 (函数 `tile_upscale`) |

#### 6.2 RealESRGAN

| 属性 | 值 |
|------|------|
| **权重文件** | `models/upscale/RealESRGAN_x2.pth`, `RealESRGAN_x4.pth` |
| **功能** | 传统 GAN 超分辨率，2x/4x 放大 |
| **位置** | `upscale_flow.py` 第 102-108 行 |

#### 6.3 Stable Diffusion x4 Upscaler

| 属性 | 值 |
|------|------|
| **模型 ID** | `stabilityai/stable-diffusion-x4-upscaler` |
| **功能** | 官方 4x 放大模型 |
| **位置** | `lcm.py` 第 821-830 行 (函数 `standard_upscale`) |

---

## ⚡ 推理管道流程

```
用户输入 (线稿 + 颜色分割图)
          ↓
    ┌─────────────────────────────────────────┐
    │         load_models_multiple_cn()       │
    │  ┌───────────────────────────────────┐  │
    │  │  Stable Diffusion (Dreamshaper)  │  │
    │  │         + LCM-LoRA               │  │
    │  └───────────────────────────────────┘  │
    │         ↓           ↓                   │
    │  ┌──────────┐ ┌──────────┐              │
    │  │ControlNet│ │ControlNet│              │
    │  │ Scribble │ │   Seg    │              │
    │  └──────────┘ └──────────┘              │
    │         ↓           ↓                   │
    │  ┌───────────────────────────────────┐  │
    │  │        IP-Adapter                 │  │
    │  │   (风格参考图像注入)              │  │
    │  └───────────────────────────────────┘  │
    └─────────────────────────────────────────┘
          ↓
    生成图像 (512x384)
          ↓
    [可选] tile_upscale() → 高分辨率图像
```

---

## 🔧 常见修改场景

### 场景 1: 更换基础模型

```python
# lcm.py 第 563 行
def load_models_multiple_cn(model_id="你的新模型ID", use_ip=True):
```

### 场景 2: 调整 ControlNet 强度

```python
# lcm.py 第 620 行 infer() 函数参数
cn_strength=[0.8, 0.8]  # [线稿强度, 分割强度]
```

### 场景 3: 调整 IP-Adapter 风格强度

```python
# lcm.py 第 618 行
ip_scale=0.8  # 范围 0.0-1.0，越高风格越像参考图
```

### 场景 4: 修改默认推理步数

```python
# lcm.py 第 614 行
num_inference_steps=8  # LCM: 4-8, Hyper-SD: 12
```

### 场景 5: 添加新的 ControlNet

```python
# lcm.py 第 572-574 行
controlnets = [
    ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-scribble", ...),
    ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-seg", ...),
    ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-depth", ...),  # 新增
]
```

---

## 📦 模型缓存位置

所有模型自动下载到项目根目录的 `models/` 文件夹:

```
BeautiArch/
└── models/
    ├── hub/                    # HuggingFace 模型缓存
    ├── upscale/                # RealESRGAN 权重
    │   ├── RealESRGAN_x2.pth
    │   └── RealESRGAN_x4.pth
    └── edge_model.yml          # 边缘检测模型
```

---

## ⚠️ 注意事项

1. **显存需求**: 完整管道需要约 8-10GB VRAM
2. **首次启动慢**: 模型会自动从 HuggingFace 下载，首次需要较长时间
3. **自定义模型**: 放入 `custom_models/` 文件夹，使用 `custom_models/xxx.safetensors` 格式调用
4. **Mac 支持**: 自动切换到 MPS 设备，但 Hyper-SD 可能不完全兼容
