# -*- coding: utf-8 -*-
"""
Created on Thu Dec  6 00:11:51 2018

@author: VRDesktrop
"""

def ReadTFRecord(file):
    with tf.name_scope('data_provider'):
        reader = tf.TFRecordReader()
        _, serialized_example = reader.read(file)
        features = tf.parse_single_example(serialized_example, features = {
            "height": tf.FixedLenFeature([], tf.int64),
            "width": tf.FixedLenFeature([], tf.int64),
            "image_raw": tf.FixedLenFeature([], tf.string),
            "label": tf.FixedLenFeature([], tf.int64),})
        image_raw = tf.image.decode_png(features['image_raw'], channels=1)
        image_object = PN.PNG_Image()
        # image_object.image = tf.image.resize_image_with_crop_or_pad(image_raw, IMAGE_SIZE, IMAGE_SIZE)
        image_object.image = tf.image.resize_images(image_raw, [image_size, image_size], method=0, align_corners=True)
        image_object.height = features["height"]
        image_object.width = features["width"]
        image_object.image_raw = features["image_raw"]
        image_object.label = tf.cast(features["label"], tf.int64)
    return image_object 
    
def feedData(if_random = True, if_training = True):
    file = None
    with tf.name_scope("Preprocessor") as scope:
        if if_training:
            file = [tfrecords_file]
            f = tf.train.string_input_producer(file)
            image_object = ReadTFRecord(f)
            label = image_object.label
            
            
            img = tf.cast(tf.image.random_flip_left_right(image_object.image), tf.float32)
            num_preprocess_threads = 2
            
            image_batch, label_batch = tf.train.batch(
                    [img, label],
                    batch_size = batch_size,
                    num_threads = num_preprocess_threads)
            
            image_batch = tf.reshape(image_batch, (batch_size, image_size, image_size, img_channels))
            label_offset = -tf.ones([batch_size], dtype=tf.int64, name="label_batch_offset")
            label_batch = tf.one_hot(tf.add(label_batch, label_offset), depth=5, on_value=1.0, off_value=0.0)
            
            return image_batch, label_batch
        else:
            file = tfrecords_test_file
            
            
            
            
            class Dataset():
    # Dataset parameters:
    # data_dir = path to image directory
    # image_list_file = path to the file containing images with labels
    def __init__(self, data_dir, image_list_file, transform=None):
        image_names = []
        labels = []
        
        with open(image_list_file, "r") as f:
             reader = csv.DictReader(f)
             
             #for row in reader:
             
             
             
             
             
                 def __init__(self, data_dir, comparator_file, image_list_file ,IMG_SIZE):
        """
        Args:
            data_dir: path to image directory.
            image_list_file: path to the file containing images
                with corresponding labels.
        """
        comparer = []
        with open(comparator_file) as f:
            for line in f:
                comparer.append(line)
        
        setRow = 0
        
        
        image_names = []
        labels = []
        with open(image_list_file, "r") as f:
            for line in f:
                items = line.split()
                image_name= items[0]
                label = items[1:]
                
                for row in comparer[setRow:]:
                    if image_name.strip('\n') == row.strip('\n'):
                        label = [int(i) for i in label]
                        image_name = os.path.join(data_dir, image_name)
                        image_names.append(image_name)
                        labels.append(label)
                
                

        self.image_names = image_names
        self.labels = labels
        self.IMG_SIZE=IMG_SIZE
                 