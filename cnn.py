import os
import time

import imageio as io
import pandas as pd
import torch
import torch.nn as nn

from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
import torch.optim as optim


TARGET_VAR = "Eyeglasses"

class CelebADataset(Dataset):
    def __init__(self, target, partition, ids=[]):
        attrs = pd.read_csv("attr_clean.csv", sep=" ")
        part = pd.read_csv("list_eval_partition.csv", sep=" ")
        part = part.drop("Image_Name", axis=1)
        attrs = attrs.join(part)
        attrs.loc[attrs[target] == -1, target] = 0
        
        if len(ids) > 0:
            attrs = attrs.iloc[ids]
        if partition == 3:
            self.attrs = attrs.drop("Label", axis=1)
        else:  
            self.attrs = attrs[attrs["Label"] == partition].drop("Label", axis=1)
        self.target = target
        self.root_dir = "./img_align_celeba/img_align_celeba/" 
        self.transform = transforms.Compose([transforms.ToTensor()])

    def __len__(self):
        return len(self.attrs)

    def __getitem__(self, idx):
        img_name = os.path.join(self.root_dir,
                                self.attrs.iloc[idx]["Image_Name"])
        image = Image.open(img_name)
        image = self.transform(image)

        attrs = self.attrs.iloc[idx]
        sample = (image, attrs[self.target], attrs.to_dict())
        
        return sample


class cnn(nn.Module):
    def __init__(self):
        super(cnn, self).__init__()
        self.layer1 = nn.Sequential(
            nn.Conv2d(3, 8, kernel_size=5, stride=2, padding=2),
            nn.BatchNorm2d(8),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2))
        self.layer2 = nn.Sequential(
            nn.Conv2d(8, 16, kernel_size=5, stride=2, padding=2),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2))
        self.layer3 = nn.Sequential(
            nn.Conv2d(16, 32, kernel_size=5, stride=2, padding=2),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2))
        self.fc = nn.Linear(288, 1)
        self.final = nn.Sigmoid()

    def forward(self, x):
        out = self.layer1(x)
        out = self.layer2(out)
        out = self.layer3(out)
        out = out.reshape(out.size(0), -1)
        out = self.fc(out)
        out = self.final(out)

        return out


def train(model, data_loader, epochs):
    optimizer = optim.Adam(model.parameters(), lr=.0002, betas=(0.5, 0.999))
    BCE_loss = nn.BCELoss()

    model.train()
    for epoch in range(epochs):
        print("Training epoch", epoch)

        losses = []
        epoch_start_time = time.time()
        for x, y, _ in data_loader:
            model.zero_grad()
            out = model(x)
            loss = BCE_loss(out.squeeze(), y.squeeze().float())
            loss.backward()
            optimizer.step()
            losses.append(loss.item())
            print(loss)

        print("loss", torch.mean(torch.FloatTensor(losses)))
        epoch_end_time = time.time()
        per_epoch_ptime = epoch_end_time - epoch_start_time
        print("epoch time", per_epoch_ptime)


def get_accuracy(model, data_loader):
    model.eval()
    with torch.no_grad():
        correct = 0
        total = 0
        for images, labels, _ in data_loader:
            pred = model(images)
            correct += (
                (pred.squeeze().round().long() == labels).sum().item()
            )
            total += labels.shape[0]
        return 100 * correct / total
