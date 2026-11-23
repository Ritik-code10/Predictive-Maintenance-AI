
from datasets import load_dataset
import pandas as pd
import os

# 1. Hugging Face dataset repository
dataset_name = "TinchoARS/AI4I-2020-Predictive-Maintenance"

print("Downloading dataset from Hugging Face...")

# 2. Load dataset
dataset = load_dataset(dataset_name, split="train")

# 3. Convert to Pandas DataFrame
df = dataset.to_pandas()

# 4. Create directory
os.makedirs("data/raw", exist_ok=True)

# 5. Save dataset
df.to_csv("data/raw/ai4i2020.csv", index=False)

# 6. Display dataset information
print("\nDataset downloaded successfully!")

print("\nDataset Shape:")
print(df.shape)

print("\nColumn Names:")
print(df.columns.tolist())

print("\nFirst 5 Records:")
print(df.head())

print("\nDataset Information:")
df.info()

print("\nMissing Values:")
print(df.isnull().sum())

print("\nTarget Distribution:")
print(df["Machine failure"].value_counts())
