"""
Test script for all line detection methods
"""
import sys
import os
import cv2
import numpy as np

# Add paths for importing
sys.path.insert(0, '/home/livablecity/BeautiArch')
sys.path.insert(0, '/home/livablecity/BeautiArch/backend')

# Test image path
INPUT_IMAGE = "/home/livablecity/BeautiArch/resources/img/AI_ref_images_bo/building_anime/church_ghibli.png"
OUTPUT_DIR = "/home/livablecity/BeautiArch"

# Method names
METHOD_NAMES = {
    0: "Sobel_Custom",
    1: "Canny", 
    2: "Canny_L2",
    3: "Canny_BIL",
    4: "Canny_Blur",
    5: "RF_Custom",
    6: "HED_AI",
    7: "Lineart_AI",
    8: "Lineart_Coarse_AI",
    9: "PiDiNet_AI"
}

def test_opencv_methods(image):
    """Test OpenCV-based methods (0-5)"""
    import lcm
    
    results = {}
    for method_id in range(6):
        try:
            print(f"Testing method {method_id}: {METHOD_NAMES[method_id]}...")
            result = lcm.screen_to_lines(image.copy(), method_id)
            results[method_id] = result
            print(f"  ✓ Success")
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results[method_id] = None
    
    return results

def test_hf_methods(image):
    """Test HuggingFace-based methods (6-9)"""
    from app.services.hf_line_detectors import process_with_hf_detector
    
    results = {}
    for method_id in range(6, 10):
        try:
            print(f"Testing method {method_id}: {METHOD_NAMES[method_id]}...")
            result = process_with_hf_detector(image.copy(), method_id)
            results[method_id] = result
            print(f"  ✓ Success")
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results[method_id] = None
    
    return results

def main():
    print(f"Loading test image: {INPUT_IMAGE}")
    image = cv2.imread(INPUT_IMAGE)
    
    if image is None:
        print(f"Error: Could not load image from {INPUT_IMAGE}")
        return
    
    print(f"Image loaded: {image.shape}")
    print()
    
    # Test OpenCV methods
    print("=" * 50)
    print("Testing OpenCV Methods (0-5)")
    print("=" * 50)
    opencv_results = test_opencv_methods(image)
    
    # Test HuggingFace methods
    print()
    print("=" * 50)
    print("Testing HuggingFace Methods (6-9)")
    print("=" * 50)
    hf_results = test_hf_methods(image)
    
    # Combine results
    all_results = {**opencv_results, **hf_results}
    
    # Save results
    print()
    print("=" * 50)
    print("Saving Results")
    print("=" * 50)
    
    for method_id, result in all_results.items():
        if result is not None:
            output_path = os.path.join(OUTPUT_DIR, f"result_{method_id}_{METHOD_NAMES[method_id]}.png")
            cv2.imwrite(output_path, result)
            print(f"Saved: {output_path}")
        else:
            print(f"Skipped method {method_id} (failed)")
    
    print()
    print("Testing complete!")

if __name__ == "__main__":
    main()
