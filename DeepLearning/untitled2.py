# -*- coding: utf-8 -*-
"""
Created on Thu Dec  6 00:19:33 2018

@author: VRDesktrop
"""

beginTime = time.time()



#------------------------------------------------------------
# Variables
#------------------------------------------------------------


# Parameter definitions
batch_size = 100
learning_rate = 0.05
max_steps = 100

# File TF REcords
filenames = [tfrecords_file]



#---------------------------------
# TENSORFLOW GRAPH DEFINITION
#---------------------------------
# Define input placeholders
images_placeholder = tf.placeholder(tf.float32, shape=[None,65536])
labels_placeholder = tf.placeholder(tf.int64)
labels_placeholder = tf.placeholder(tf.int64, shape=[None])

# Define variables (these are the values we want to optimize)
weights = tf.Variable(tf.zeros([65536, 15]))
biases = tf.Variable(tf.zeros([15]))
tf.summary.histogram("weights", weights)
tf.summary.histogram("biases", biases)
print(weights)
# Define the classifier's result
logits = tf.matmul(images_placeholder, weights) + biases
print(logits)
# Define the loss function
loss = tf.reduce_mean(tf.nn.sparse_softmax_cross_entropy_with_logits(logits=logits,
  labels=labels_placeholder))
print(loss)
train_step = tf.train.GradientDescentOptimizer(learning_rate).minimize(loss)
print(train_step)
# Operation comparing prediction with true label
correct_prediction = tf.equal(tf.argmax(logits, 1), labels_placeholder)

# Operation calculating the accuracy of our predictions
accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))

#---------------------------------
# END OF GRAPH DEFINITION
#---------------------------------

# Operation merging summary data for TensorBoard
#summary = tf.summary.merge_all()

# The op for initializing the variables.
init_op = tf.group(tf.global_variables_initializer(),tf.local_variables_initializer())


# In[21]:

#------------------------------------------------------------
# Function to parse features for each object in the tfrecord
#------------------------------------------------------------

def _parse_record(tf_record):
    print('Parse Fn tf_record Called')
    features={
             'height': tf.FixedLenFeature([], tf.int64),
             'width': tf.FixedLenFeature([], tf.int64),
             'image_raw': tf.FixedLenFeature([], tf.string),
             'label': tf.FixedLenFeature([], tf.int64)
             }
    record = tf.parse_single_example(tf_record, features)

    image_raw = tf.decode_raw(record['image_raw'], tf.uint8)
    print(image_raw.shape)
    image_decoded = tf.reshape(image_raw, [-1,256,256])
    image_decoded = tf.reshape(image_decoded,[65536])
    print(image_decoded.shape)

    #------------------------------------------------------
    # SOME OF THE DECODED RAW IMAGES SEEM TO HAVE THE TENSOR SHAPE 4,256,256 instead of 1,256,256
    # The filesize of the images might have something to do here... as removing files greater than 500KB
    # got the iterator moving forward again - HARI
    #----------------------------------------------------

    label = tf.cast(record['label'], tf.int32)
    return image_decoded, label

#------------------------------------------------------------
# end of Parse function
#------------------------------------------------------------


# In[22]:

#------------------------------------------------------------
# TFRECORD Dataset Iterator
#------------------------------------------------------------
dataset = tf.data.TFRecordDataset(filenames)
dataset = dataset.map(_parse_record)
dataset = dataset.batch(batch_size)
iterator = dataset.make_initializable_iterator()
next_element = iterator.get_next()


# In[23]:

saver = tf.train.Saver()

with tf.Session() as sess:

    summary_writer = tf.summary.FileWriter("E:\\tmp\\xray\\log\\softmax",graph=tf.get_default_graph())
    sess.run(init_op)
    for i in range(10):
        sess.run(iterator.initializer)
        while True:
            try:
                images_batch, labels_batch = sess.run(next_element)
                print(images_batch.shape)
                feed_dict = {
                  images_placeholder: images_batch,
                  labels_placeholder: labels_batch
                            }
                # Periodically print out the model's current accuracy
                #if i % 100 == 0:
                train_accuracy = sess.run(accuracy, feed_dict=feed_dict)
                print('Step {:5d}: training accuracy {:g}'.format(i, train_accuracy))

                #Training STEP
                sess.run(train_step, feed_dict=feed_dict)
            except tf.errors.OutOfRangeError:
                  break



    save_path = saver.save(sess, "trained_model.ckpt")
    print("Model saved in file: %s" % save_path)



    sess.close()


# In[ ]:




# In[ ]:

endTime = time.time()
print('Total time: {:5.2f}s'.format(endTime - beginTime))