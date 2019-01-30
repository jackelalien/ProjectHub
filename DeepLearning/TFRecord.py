# -*- coding: utf-8 -*-
"""
Created on Sat Nov 17 18:47:34 2018

@author: Jeffrey Laborde
"""

import tensorflow as tf
import csv, os
from PIL import Image
import numpy as np

class TFRecord():
    # Init the TFRecord class with the image dimensions, source folder, data file, and class list.
    def __init__(self, dataFile, source, img_h, img_w, classList):
        self.img_height = img_h
        self.img_width = img_w
        self.source_folder = source
        self.data = dataFile
        self.classList = classList
        
    # Init the CSV Data by passing in the necessary labels for reading
    # PARAMS:
    # indexLabel - the label of the image names.
    # findingLabel - the label of the classes we are looking for.
    # SplitChar - should a findingLabel have more than one class, split it by the split character.
    # Comparator File - Text/CSV containing the list of training/validation or testing data.
    def initCSVData(self, indexLabel, findingLabel, splitChar, comparator_file):
        # This would be the Finding Label in the NIH Dataset. Check the TB and PN datasets
        self.classLabel = findingLabel
        self.splitChar = splitChar
        self.indexLabel = indexLabel
        self.comparer = []
        
        # Add the data from the comparator file to the comparison array
        with open(comparator_file) as f:
            for line in f:
                self.comparer.append(line)
    
    # Training functions - helps write information to the records
    # Train Byte Data
    def trainBytes(self, value):
        return tf.train.Feature(bytes_list=tf.train.BytesList(value=[value]))
    
    # Train Integer Data
    def trainInt64(self, value):
        return tf.train.Feature(int64_list=tf.train.Int64List(value=[value]))
    
    # Write the data to a TF record file - it's much easier to navigate
    # Write Validation and Test data here too!
    def ConvertToRecord(self, record_file):
        writer = tf.python_io.TFRecordWriter(record_file)
        
        
        # Data = CSV File
        with open(self.data) as csvFile:
            # This if True isn't necessary. It's a placeholder because a mistake was made here earlier, and would require unindentions.
            if True:
                
                # Set up our CSV Reader
                reader = csv.DictReader(csvFile)
                
                # This variable is for calculating where to read the comparison list.
                setRow = 0
                
                
                for row in reader:
                    # Add the class list and the image path.
                    class_list = row[self.classLabel].split(self.splitChar)
                    img_path = os.path.join(self.source_folder, row[self.indexLabel])
                    goOn = False

                    # Check the comparison (training) list to see if a match exists.
                    for row2 in self.comparer[setRow:]:
                        if row[self.indexLabel].strip('\n') == row2.strip('\n'):                
                            goOn = True
                            setRow += 1
                            break

                    # If image not on training list, do not go on.
                    if goOn == False:
                        pass
                    else:
                        # Create a record entry for each class found in the current data row.
                        for classification in class_list:
                            label = self.classList.index(classification)
                            
                            if(os.path.exists(img_path)):
                                img = Image.open(img_path)
                                
                                # A Reize function in case the user wants to downscale the images.
                                img = img.resize((self.img_width, self.img_height), Image.ANTIALIAS)
                                main_img = np.array(img)
                                img_raw = main_img.tostring()
                                
                                h = main_img.shape[0]
                                w = main_img.shape[1] 
                                
                                # Place all the data into a record here. 
                                ex = tf.train.Example(features=tf.train.Features(feature= {
                                        'label': self.trainInt64(label),
                                        'height': self.trainInt64(h),
                                        'width': self.trainInt64(w),
                                        'image_raw': self.trainBytes(img_raw)}))
                                
                                writer.write(ex.SerializeToString())
            
            writer.close()
    