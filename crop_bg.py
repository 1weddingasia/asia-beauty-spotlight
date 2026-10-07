from PIL import Image
import sys

def crop_and_remove_bg(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    
    # 1. Get bounding box of non-transparent and non-white pixels
    # Since we already removed the white bg, we just get bbox of non-transparent
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(out_path, "PNG")

if __name__ == "__main__":
    crop_and_remove_bg(sys.argv[1], sys.argv[2])
