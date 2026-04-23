package com.mcgill.booking.repository;

import com.mcgill.booking.entity.BookingSlot;
import com.mcgill.booking.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingSlotRepository extends CrudRepository<BookingSlot, Long> {
    
    List<BookingSlot> findByActiveTrue(); 

    List<BookingSlot> findByOwner(User owner);

    List<BookingSlot> findByOwnerAndActiveTrue(User owner);
}