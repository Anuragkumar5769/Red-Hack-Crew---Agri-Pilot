from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch

# Load from local folder
processor = AutoImageProcessor.from_pretrained("./mobilenet_plant_disease")
model = AutoModelForImageClassification.from_pretrained("./mobilenet_plant_disease")

# Example: classify an image
image = Image.open("dd.jfif").convert("RGB")

inputs = processor(images=image, return_tensors="pt")
with torch.no_grad():
    outputs = model(**inputs)

logits = outputs.logits
predicted_class_idx = logits.argmax(-1).item()
predicted_label = model.config.id2label[predicted_class_idx]

print("Predicted:", predicted_label)
