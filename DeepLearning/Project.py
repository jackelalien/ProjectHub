# -*- coding: utf-8 -*-
"""
Created on Fri Nov 16 21:01:31 2018

@author: Jeffrey Laborde, C00083516, jxl7581

Project Features
- Read Chest X-Rays and detect abnormalities
- Locate and map the said abnormalities
- Annotation

"""

import os, time
import tensorflow as tf
import tflearn
import numpy as np
import matplotlib.pyplot as plt
import pickle

from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout, Flatten, Conv2D, BatchNormalization
from keras.applications import densenet

from tensorflow.contrib.layers import xavier_initializer
from tensorflow.contrib.framework import arg_scope

import TFRecord as TFR
import DenseNet as DN121
import PNG_Image as PN

# Set up our class list
classes = ['Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema', 'Effusion', 'Emphysema', 'Fibrosis', 'Hernia',
           'Infiltration', 'Mass', 'Normal', 'Nodule', 'Pleural_Thickening', 'Pneumonia', 'Pneumothorax', 'Tuberculosis', 'Fracture',
           'No Finding']
pneumonia_classes = ['Bacterial Pneumonia', 'Viral Pneumonia']

num_classes_primary = len(classes)
num_classes_secondary = len(pneumonia_classes)

DATA_DIR = 'File Source of data images'
TEST_IMAGE_LIST = 'TXT For test images'

# First, get our source data
source_folder = "E:\\DeepLearningFinal\\NIH_Data\\Images"
CSV_DataFile = "E:\\DeepLearningFinal\\Data_Entry_2017.csv"

# TF Records
tfrecords_file = "E:\\DeepLearningFinal\\NIH_Data\\TFRecord_Training.tfrecords"
tfrecords_test_file = "E:\\DeepLearningFinal\\NIH_Data\\TFRecord_Testing.tfrecords"
model_dir = "E:\\DeepLearningFinal\\Data\\Model"
files = [tfrecords_file]


Training_DataFile = "E:\\DeepLearningFinal\\train_val_list.csv"
Test_DataFile = "E:\\DeepLearningFinal\\test_list.csv"

# CSV Information
findingLabel = 'Finding Labels'
splitChar = '|'
indexLabel = 'Image Index'

img_height = 1024
img_width = 1024
image_size = 512
img_channels = 1

# Set up Hyper-parameters
growth_k = 23
nb_block = 2 # How many dense block + transition layyer)
init_learning_rate = 1e-4
epsilon = 1e-4 #For Adam Optimizer
dropout_rate = 0.25  #increased from 0.2 for better training time


# Momentum Optimizer
nesterov_momentum = 0.9
weight_decay = 1e-4
iteration = 782
batch_size = 64
test_iteration = 10

learning_rate = 0.01
epochs = 50 # Reduced from 500 for quicker training times.
display_step = 100
n_hidden_1 = 600
n_hidden_2 = 600
input_size = 2500 

record_Train = None
record_Test = None

## TF Record Creation
create_tf_record = True
create_test_tf_record = True

if(create_tf_record):
    print("Creating TF Record - Training / Validation")
    record = TFR.TFRecord(CSV_DataFile, source_folder, img_height, img_width, classes)
    record.initCSVData(indexLabel, findingLabel, splitChar, Training_DataFile)
    record.ConvertToRecord(tfrecords_file)
    
    print("Finished Record Conversion")
    
if(create_test_tf_record):
    record = TFR.TFRecord(CSV_DataFile, source_folder, img_height, img_width, classes)
    record.initCSVData(indexLabel, findingLabel, splitChar, Test_DataFile)
    record.ConvertToRecord(tfrecords_test_file)
    
    print("Finished Record Conversion!")


def prepare_data(tf_record):
    print("Loading Data")
    if True:
        feature = {
                'image_raw': tf.FixedLenFeature([], tf.string),
                'width': tf.FixedLenFeature([], tf.int64),
                'height': tf.FixedLenFeature([], tf.int64),
                'label': tf.FixedLenFeature([], tf.int64)        
                }
        
        #filename_queue = tf.train.string_input_producer(files, num_epochs=1)
        #reader = tf.TFRecordReader()
        #_, seralized = reader.read(filename_queue)
        
        features = tf.parse_single_example(tf_record, features=feature)
        
        image = tf.decode_raw(features['image_raw'], tf.uint8)
        label = tf.cast(features['label'], tf.int32)
        image = tf.reshape(image, [1024, 1024, img_channels])
        
        resize_image = tf.image.resize_images(image, size=[image_size,image_size], method=tf.image.ResizeMethod.NEAREST_NEIGHBOR)
        resize_image = tf.image.per_image_standardization(resize_image)
        resize_image = tf.image.random_flip_left_right(resize_image)
        
        #images, labels = tf.train.shuffle_batch([resize_image, label], batch_size=100, capacity=300, num_threads=1, min_after_dequeue=10)
        
        return resize_image, label
    

    
    
def input_func():
   print("input function") 
    
    #iterator = dataset.one shot iterator()
    #batch_img, batch_labels = iterator.get_next()
    #return batch_img, batch_labels

def train_densenet():
    dataset = tf.data.TFRecordDataset(files)
    dataset = dataset.map(prepare_data)
    dataset = dataset.batch(batch_size)
    iterator = dataset.make_initializable_iterator()
    next_element = iterator.get_next()
    
    #train_x, train_y = input_func()
    #image_batch, label_batch = prepare_data()
    #test_x = 0
    #test_y = 0
    
    #train_x, train_y, test_x, test_y = prepare_data()
    batch_x = None
    batch_y = None
    
    
    
    print("Training")
    # Image Batch Placeholder 
    x = tf.placeholder(tf.float32, shape=[None, img_height, img_width, img_channels])
    
    # Label Batch Placeholder
    labels = tf.placeholder(tf.float32, shape=[None, num_classes_primary])
    
    # Training Flag Placeholder
    training_flag = tf.placeholder(tf.bool)
    
    # Learning Rate Placeholder
    learn_rate = tf.placeholder(tf.float32, name='learning_rate')
    
    #image_batch, label_batch = feedData()

    with tf.variable_scope(tf.get_variable_scope(), reuse=tf.AUTO_REUSE):
        
        config = tf.ConfigProto()
        config.gpu_options.allow_growth = True
    
        # Create DenseNet and HyperParameters
        print("Creating DenseNet")
        dense = DN121.DenseNet(x=x, nb_blocks=nb_block, filters=growth_k, training=training_flag,image_size=image_size, class_num=num_classes_primary)
        dense.defineHyperParameters(dropout_rate=dropout_rate, total_epochs=epochs)
        dense.createModel(x)
        mdl = dense.model
    
    
        #loss = tf.reduce_sum(tf.nn.softmax_cross_entropy_with_logits(labels=labels, logits=mdl))
        
        print("Creating Loss/Optimization Functions")
        cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(labels=labels, logits=mdl))
        optimizer = tf.train.AdamOptimizer(learning_rate=learn_rate, epsilon=epsilon)
        train = optimizer.minimize(cost) #total_loss
        

        #Removed stuff here
        
        correct_prediction = tf.equal(tf.argmax(mdl, 1), tf.argmax(labels, 1))
        accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))
    

    
        saver = tf.train.Saver(tf.global_variables())
    
        # Also here
        
        with tf.Session() as sess:
            sess.run(iterator.initializer)
            #coord = tf.train.Coordinator()
            #threads = tf.train.start_queue_runners(coord=coord)
            
            print("Running TF Session")
            
            ckpt = tf.train.get_checkpoint_state('./model')
            if ckpt and tf.train.checkpoint_exists(ckpt.model_checkpoint_path):
                saver.restore(sess, ckpt.model_checkpoint_path)
            else:
                sess.run(tf.global_variables_initializer())

            summary_writer = tf.summary.FileWriter('./logs', sess.graph)

            epoch_learning_rate = init_learning_rate
            
            print("Running Epochs")
            for epoch in range(1, epochs + 1):
                if epoch == (epochs * 0.5) or epoch == (epochs * 0.75):
                    epoch_learning_rate = epoch_learning_rate / 10

                pre_index = 0
                train_acc = 0.0
                train_loss = 0.0
                
                print("Getting Training Batch!")
                train_x, train_y = sess.run(next_element)
                print("Got training batch!")
                
                
                for step in range(1, iteration + 1):
                    
                    if pre_index+batch_size < 10000:
                        batch_x = train_x[pre_index : pre_index+batch_size]
                        batch_y = train_y[pre_index : pre_index+batch_size]
                    else:
                        batch_x = train_x[pre_index : ]
                        batch_y = train_y[pre_index : ]
                    
                    #batch_x = train_x
                        
                    #batch_x = Data Augmentation??
                    #batch_x = tflearn.data_augmentation()
                    
                    train_feed_dict = {
                            x: batch_x,
                            labels: batch_y,
                            learning_rate: epoch_learning_rate,
                            training_flag: True}
                    
                    _, batch_loss = sess.run([train,cost], feed_dict=train_feed_dict)
                    batch_acc = accuracy.eval(feed_dict=train_feed_dict)
                    
                    train_loss += batch_loss
                    train_acc += batch_acc
                    pre_index += batch_size

                    if step == iteration :
                        train_loss /= iteration # average loss
                        train_acc /= iteration # average accuracy

                        train_summary = tf.Summary(value=[tf.Summary.Value(tag='train_loss', simple_value=train_loss),
                                                  tf.Summary.Value(tag='train_accuracy', simple_value=train_acc)])

                        dense.defineTestingData()
                        dense.defineDictItems(labels, x, epoch_learning_rate, learning_rate, cost, accuracy, training_flag)
                        test_acc, test_loss, test_summary = dense.Evaluate(sess)

                        summary_writer.add_summary(summary=train_summary, global_step=epoch)
                        summary_writer.add_summary(summary=test_summary, global_step=epoch)
                        summary_writer.flush()

                        line = "epoch: %d/%d, train_loss: %.4f, train_acc: %.4f, test_loss: %.4f, test_acc: %.4f \n" % (
                                epoch, epochs, train_loss, train_acc, test_loss, test_acc)
                        print(line)

                        with open('logs.txt', 'a') as f :
                            f.write(line)

                saver.save(sess=sess, save_path='./model/dense.ckpt')
            sess.close()
                    
    

def startup():  
    tf.reset_default_graph()
    train_densenet()
    
    
    
    
startup()










